// Content script untuk mendeteksi dan mengunduh file dari iframe
(function() {
    'use strict';

    // Fungsi untuk mengekstrak nama file yang bersih dari URL
    function extractCleanFileName(url) {
        try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            const rawFileName = pathname.split('/').pop() || 'document.pdf';
            const decodedFileName = decodeURIComponent(rawFileName);
            
            // Potong nama file jika terlalu panjang untuk display
            return decodedFileName.length > 25 ? 
                decodedFileName.substring(0, 25) + '...' : decodedFileName;
        } catch (e) {
            return 'document.pdf';
        }
    }

    // Fungsi untuk mencari iframe dengan URL S3
    function findS3Iframes() {
        const iframes = document.querySelectorAll('iframe');
        const s3Iframes = [];
        
        iframes.forEach(iframe => {
            const src = iframe.src;
            if (src && src.includes('s3.arsip.go.id/srikandi-prod/naskah-dinas-keluar/')) {
                s3Iframes.push({
                    element: iframe,
                    url: src
                });
            }
        });
        
        return s3Iframes;
    }

    // Fungsi untuk membuat tombol download
    function createDownloadButton(iframeData) {
        const button = document.createElement('button');
        const fileName = extractCleanFileName(iframeData.url);
        
        button.innerHTML = '📥 Unduh File';
        button.title = `Download: ${fileName}`;
        button.style.cssText = `
            position: absolute;
            top: 10px;
            right: 10px;
            z-index: 9999;
            padding: 8px 12px;
            background: #007acc;
            color: white;
            border: none;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: all 0.2s ease;
        `;
        
        button.addEventListener('click', function() {
            // Ubah tampilan tombol saat proses download
            const originalText = this.innerHTML;
            this.innerHTML = '⏳ Mengunduh...';
            this.disabled = true;
            this.style.background = '#ffc107';
            
            downloadFile(iframeData.url, (success) => {
                setTimeout(() => {
                    if (success) {
                        this.innerHTML = '✅ Berhasil';
                        this.style.background = '#28a745';
                    } else {
                        this.innerHTML = '❌ Gagal';
                        this.style.background = '#dc3545';
                    }
                    
                    // Reset tombol setelah 3 detik
                    setTimeout(() => {
                        this.innerHTML = originalText;
                        this.disabled = false;
                        this.style.background = '#007acc';
                    }, 3000);
                }, 500);
            });
        });
        
        return button;
    }

    // Fungsi untuk mengunduh file
    function downloadFile(url, callback) {
        // Kirim pesan ke background script untuk mengunduh
        chrome.runtime.sendMessage({
            action: 'downloadFile',
            url: url
        }, function(response) {
            const success = response && response.success;
            
            if (success) {
                showNotification('File berhasil diunduh!', 'success');
            } else {
                showNotification('Gagal mengunduh file: ' + (response?.error || 'Unknown error'), 'error');
            }
            
            if (callback) callback(success);
        });
    }

    // Fungsi untuk menampilkan notifikasi
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            font-weight: bold;
            ${type === 'success' ? 'background: #28a745;' : 'background: #dc3545;'}
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Fungsi untuk menambahkan tombol download ke iframe
    function addDownloadButtons() {
        const s3Iframes = findS3Iframes();
        
        s3Iframes.forEach(iframeData => {
            const iframe = iframeData.element;
            const parent = iframe.parentElement;
            
            // Pastikan parent memiliki position relative
            if (getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            
            // Cek apakah tombol sudah ada
            const existingButton = parent.querySelector('.srikandi-download-btn');
            if (!existingButton) {
                const downloadBtn = createDownloadButton(iframeData);
                downloadBtn.classList.add('srikandi-download-btn');
                parent.appendChild(downloadBtn);
            }
        });
    }

    // Jalankan saat halaman dimuat
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addDownloadButtons);
    } else {
        addDownloadButtons();
    }

    // Observer untuk mendeteksi perubahan DOM (jika iframe dimuat secara dinamis)
    const observer = new MutationObserver(function(mutations) {
        let shouldCheck = false;
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1 && (node.tagName === 'IFRAME' || node.querySelector('iframe'))) {
                        shouldCheck = true;
                    }
                });
            }
        });
        
        if (shouldCheck) {
            setTimeout(addDownloadButtons, 1000);
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Tambahkan CSS untuk hover effect
    const style = document.createElement('style');
    style.textContent = `
        .srikandi-download-btn:hover {
            background: #005a9e !important;
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.3) !important;
        }
    `;
    document.head.appendChild(style);

    // Listener untuk pesan dari popup
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
        if (request.action === 'getIframes') {
            const s3Iframes = findS3Iframes();
            sendResponse({
                iframes: s3Iframes.map(iframe => ({
                    url: iframe.url
                }))
            });
        } else if (request.action === 'checkIframes') {
            addDownloadButtons();
        }
    });

})();