// Export Module
const ExportModule = (function() {
    // Generate HTML code from profile data
    function generateHTMLCode(profile, isVip) {
        const themeColors = {
            default: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            vip: 'linear-gradient(135deg, #FFD700 0%, #FF9500 100%)',
            ocean: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
            sunset: 'linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)',
            forest: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)'
        };
        
        const bgColor = themeColors[profile.theme] || themeColors.default;
        
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${profile.name} - LinkTree</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        
        body {
            background: #f9fafb;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        
        .linktree-container {
            width: 100%;
            max-width: 500px;
            background: ${bgColor};
            border-radius: 12px;
            padding: 40px 30px;
            color: white;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            text-align: center;
        }
        
        .profile-image {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            margin: 0 auto 20px;
            overflow: hidden;
            border: 5px solid rgba(255,255,255,0.3);
        }
        
        .profile-image img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
        
        .profile-name {
            font-size: 24px;
            margin-bottom: 10px;
            font-weight: bold;
        }
        
        .profile-bio {
            opacity: 0.9;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .links-container {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        .link-item {
            background: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 8px;
            text-decoration: none;
            color: white;
            display: flex;
            align-items: center;
            gap: 15px;
            transition: all 0.3s ease;
            backdrop-filter: blur(10px);
        }
        
        .link-item:hover {
            background: rgba(255,255,255,0.3);
            transform: translateY(-2px);
        }
        
        .link-item i {
            font-size: 18px;
        }
        
        .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid rgba(255,255,255,0.2);
            font-size: 14px;
            opacity: 0.8;
        }
        
        .vip-badge {
            display: ${isVip ? 'inline-block' : 'none'};
            background: rgba(255,255,255,0.3);
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="linktree-container">
        <div class="profile-image">
            <img src="${profile.image}" alt="${profile.name}">
        </div>
        <h1 class="profile-name">${profile.name} ${isVip ? '<span class="vip-badge"><i class="fas fa-crown"></i> VIP</span>' : ''}</h1>
        <p class="profile-bio">${profile.bio}</p>
        
        <div class="links-container">
            ${profile.links.map(link => `
            <a href="${link.url}" class="link-item" target="_blank">
                <i class="${link.icon}"></i>
                <span>${link.name}</span>
                <i class="fas fa-external-link-alt" style="margin-left: auto;"></i>
            </a>
            `).join('')}
        </div>
        
        <div class="footer">
            <p>Made with ❤️ using LinkTree VIP</p>
            <p>© ${new Date().getFullYear()} ${profile.name}</p>
        </div>
    </div>
    
    <script>
        // Click tracking
        document.querySelectorAll('.link-item').forEach(link => {
            link.addEventListener('click', function() {
                console.log('Link clicked:', this.href);
            });
        });
    </script>
</body>
</html>`;
    }

    // Generate HTML file download
    function generateHTML(state) {
        const htmlCode = generateHTMLCode(state.profile, state.isVip);
        const blob = new Blob([htmlCode], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `linktree-${state.profile.name.toLowerCase().replace(/\s/g, '-')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showExportNotification('HTML file generated and downloaded');
    }

    // Generate JSON file download
    function generateJSON(state) {
        const data = {
            profile: state.profile,
            isVip: state.isVip,
            exportDate: new Date().toISOString()
        };
        
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `linktree-${state.profile.name.toLowerCase().replace(/\s/g, '-')}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showExportNotification('JSON file downloaded');
    }

    // Show export notification
    function showExportNotification(message) {
        if (window.app && typeof window.app.showNotification === 'function') {
            window.app.showNotification(message);
        } else {
            alert(message);
        }
    }

    // Setup export modal event listeners
    function setupExportModal() {
        const exportModal = document.getElementById('exportModal');
        if (!exportModal) return;

        // Format selection
        document.querySelectorAll('.export-format').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.export-format').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateExportPreview();
            });
        });

        // Download button
        const downloadBtn = document.getElementById('downloadExport');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                const format = document.querySelector('.export-format.active')?.dataset.format;
                
                if (!format) {
                    showExportNotification('Please select export format');
                    return;
                }
                
                if (!window.app || !window.app.state) {
                    showExportNotification('Application not initialized');
                    return;
                }
                
                if (format === 'html') {
                    generateHTML(window.app.state);
                } else if (format === 'json') {
                    generateJSON(window.app.state);
                }
                
                exportModal.style.display = 'none';
            });
        }

        // Close button
        const closeBtn = document.getElementById('closeExport');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                exportModal.style.display = 'none';
            });
        }
    }

    // Update export preview
    function updateExportPreview() {
        const preview = document.getElementById('exportPreview');
        if (!preview || !window.app) return;

        const format = document.querySelector('.export-format.active')?.dataset.format || 'html';
        
        if (format === 'html') {
            const html = generateHTMLCode(window.app.state.profile, window.app.state.isVip);
            preview.textContent = html.substring(0, 500) + '...';
        } else {
            const data = {
                profile: window.app.state.profile,
                isVip: window.app.state.isVip,
                exportDate: new Date().toISOString()
            };
            preview.textContent = JSON.stringify(data, null, 2);
        }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
        setupExportModal();
    });

    // Public API
    return {
        generateHTML,
        generateJSON,
        generateHTMLCode,
        setupExportModal,
        updateExportPreview
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.ExportModule = ExportModule;
}
