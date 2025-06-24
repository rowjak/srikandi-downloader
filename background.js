// Background service worker untuk menangani download
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'downloadFile') {
        downloadFileFromS3(request.url)
            .then(() => {
                sendResponse({ success: true });
            })
            .catch((error) => {
                console.error('Download error:', error);
                sendResponse({ success: false, error: error.message });
            });
        
        // Return true untuk menandakan response akan dikirim secara asinkron
        return true;
    }
});

// Fungsi untuk mengunduh file dari S3
async function downloadFileFromS3(url) {
    try {
        // Parse URL untuk mendapatkan pathname
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        // Ekstrak nama file dari pathname (sebelum query parameters)
        const pathParts = pathname.split('/');
        let rawFileName = pathParts[pathParts.length - 1] || 'document.pdf';
        
        // Decode URL encoding (contoh: %20 menjadi spasi)
        rawFileName = decodeURIComponent(rawFileName);
        
        // Bersihkan nama file dari karakter yang tidak valid untuk Windows
        let cleanFileName = rawFileName
            .replace(/[<>:"/\\|?*]/g, '_') // Ganti karakter invalid dengan underscore
            .replace(/\s+/g, '_') // Ganti spasi dengan underscore
            .replace(/_{2,}/g, '_') // Ganti multiple underscore dengan single
            .replace(/^_+|_+$/g, ''); // Hapus underscore di awal dan akhir
        
        // Pastikan file memiliki ekstensi
        if (!cleanFileName.includes('.')) {
            cleanFileName += '.pdf';
        }
        
        // Pastikan nama file tidak terlalu panjang (max 100 karakter)
        if (cleanFileName.length > 100) {
            const ext = cleanFileName.substring(cleanFileName.lastIndexOf('.'));
            cleanFileName = cleanFileName.substring(0, 100 - ext.length - 10) + ext;
        }
        
        // Tambahkan prefix Srikandi
        const finalFileName = `Srikandi_${cleanFileName}`;
        
        console.log('Original URL:', url);
        console.log('Extracted filename:', rawFileName);
        console.log('Clean filename:', finalFileName);
        
        // Gunakan chrome.downloads API untuk mengunduh
        const downloadId = await chrome.downloads.download({
            url: url,
            filename: finalFileName,
            conflictAction: 'uniquify'
        });
        
        console.log('Download started with ID:', downloadId);
        return downloadId;
        
    } catch (error) {
        console.error('Error downloading file:', error);
        console.error('URL that caused error:', url);
        throw error;
    }
}

// Event listener untuk mengecek status ekstensi
chrome.action.onClicked.addListener((tab) => {
    // Cek apakah ekstensi aktif di tab saat ini
    if (tab.url && tab.url.includes('srikandi.arsip.go.id/pembuatan-naskah-keluar/tandatangan-naskah/')) {
        chrome.tabs.sendMessage(tab.id, { action: 'checkIframes' });
    } else {
        // Tampilkan notifikasi jika tidak di halaman yang tepat
        chrome.notifications.create({
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Srikandi Downloader',
            message: 'Ekstensi ini hanya aktif di halaman tandatangan naskah Srikandi'
        });
    }
});

// Event listener untuk menangani error download
chrome.downloads.onChanged.addListener((downloadDelta) => {
    if (downloadDelta.error) {
        console.error('Download error details:', downloadDelta);
    } else if (downloadDelta.state && downloadDelta.state.current === 'complete') {
        console.log('Download completed successfully, ID:', downloadDelta.id);
    } else if (downloadDelta.state && downloadDelta.state.current === 'interrupted') {
        console.error('Download interrupted, ID:', downloadDelta.id);
    }
});

// Debugging: Log semua download events
chrome.downloads.onCreated.addListener((downloadItem) => {
    console.log('Download created:', {
        id: downloadItem.id,
        filename: downloadItem.filename,
        url: downloadItem.url.substring(0, 100) + '...'
    });
});

chrome.downloads.onDeterminingFilename.addListener((downloadItem, suggest) => {
    console.log('Determining filename for download:', downloadItem.id);
    // Biarkan sistem menentukan filename secara otomatis
    suggest();
});