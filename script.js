// Main Application Script
class LinkTreeApp {
    constructor() {
        this.state = {
            isVip: false,
            profile: {
                name: "Alex Johnson",
                bio: "Digital Creator | Content Strategist | Sharing insights about digital marketing",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
                theme: "default",
                links: [
                    { id: 1, name: "Portfolio", url: "https://example.com", icon: "fas fa-briefcase" },
                    { id: 2, name: "Instagram", url: "https://instagram.com", icon: "fab fa-instagram" },
                    { id: 3, name: "YouTube", url: "https://youtube.com", icon: "fab fa-youtube" },
                    { id: 4, name: "Twitter", url: "https://twitter.com", icon: "fab fa-twitter" },
                    { id: 5, name: "LinkedIn", url: "https://linkedin.com", icon: "fab fa-linkedin" }
                ]
            },
            nextLinkId: 6
        };

        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.loadFromStorage();
        this.setupEventListeners();
        this.renderLinks();
        this.updatePreview();
        this.updateUI();
    }

    cacheElements() {
        this.elements = {
            // Buttons
            saveBtn: document.getElementById('saveBtn'),
            exportBtn: document.getElementById('exportBtn'),
            upgradeBtn: document.getElementById('upgradeBtn'),
            previewBtn: document.getElementById('previewBtn'),
            generateBtn: document.getElementById('generateBtn'),
            addLinkBtn: document.getElementById('addLinkBtn'),
            uploadImageBtn: document.getElementById('uploadImageBtn'),
            urlImageBtn: document.getElementById('urlImageBtn'),
            freePlanBtn: document.getElementById('freePlanBtn'),
            vipPlanBtn: document.getElementById('vipPlanBtn'),
            
            // Inputs
            profileName: document.getElementById('profileName'),
            profileBio: document.getElementById('profileBio'),
            themeSelect: document.getElementById('themeSelect'),
            imageUpload: document.getElementById('imageUpload'),
            
            // Preview
            previewName: document.getElementById('previewName'),
            previewBio: document.getElementById('previewBio'),
            previewImage: document.getElementById('previewImage'),
            profileImagePreview: document.getElementById('profileImagePreview'),
            previewLinks: document.getElementById('previewLinks'),
            linksContainer: document.getElementById('linksContainer'),
            
            // Modal close buttons
            closePayment: document.getElementById('closePayment'),
            closeExport: document.getElementById('closeExport'),
            closeUrlImage: document.getElementById('closeUrlImage'),
            cancelPaymentBtn: document.getElementById('cancelPaymentBtn'),
            cancelUrlImage: document.getElementById('cancelUrlImage'),
            
            // Notification
            notification: document.getElementById('notification'),
            notificationText: document.getElementById('notificationText'),
            notificationIcon: document.getElementById('notificationIcon'),
            
            // Upgrade Text
            upgradeText: document.getElementById('upgradeText')
        };
    }

    loadFromStorage() {
        const saved = Utils.loadFromStorage('linktreeProfile');
        if (saved) {
            Object.assign(this.state, saved);
            
            // Update form fields
            this.elements.profileName.value = this.state.profile.name;
            this.elements.profileBio.value = this.state.profile.bio;
            this.elements.themeSelect.value = this.state.profile.theme;
            
            // Update image if exists
            if (this.state.profile.image) {
                this.elements.previewImage.src = this.state.profile.image;
                this.elements.profileImagePreview.src = this.state.profile.image;
            }
            
            this.showNotification('Profile loaded successfully');
        }
    }

    saveToStorage() {
        if (Utils.saveToStorage('linktreeProfile', this.state)) {
            this.showNotification('Profile saved successfully');
        } else {
            this.showNotification('Failed to save profile', 'error');
        }
    }

    setupEventListeners() {
        // Profile inputs
        this.elements.profileName.addEventListener('input', () => this.updateProfile());
        this.elements.profileBio.addEventListener('input', () => this.updateProfile());
        this.elements.themeSelect.addEventListener('change', () => this.updateTheme());
        
        // Image upload
        this.elements.uploadImageBtn.addEventListener('click', () => this.elements.imageUpload.click());
        this.elements.urlImageBtn.addEventListener('click', () => this.showUrlImageModal());
        this.elements.imageUpload.addEventListener('change', (e) => this.handleImageUpload(e));
        this.elements.profileImagePreview.addEventListener('click', () => this.elements.imageUpload.click());
        
        // Buttons
        this.elements.saveBtn.addEventListener('click', () => this.saveToStorage());
        this.elements.exportBtn.addEventListener('click', () => this.showExportModal());
        this.elements.upgradeBtn.addEventListener('click', () => this.showPaymentModal());
        this.elements.previewBtn.addEventListener('click', () => this.updatePreview());
        this.elements.generateBtn.addEventListener('click', () => this.generateHTML());
        this.elements.addLinkBtn.addEventListener('click', () => this.addNewLink());
        
        // Plan buttons
        this.elements.freePlanBtn.addEventListener('click', () => this.setPlan('free'));
        this.elements.vipPlanBtn.addEventListener('click', () => this.showPaymentModal());
        
        // Theme selector
        document.querySelectorAll('.theme-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.theme-option').forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                this.state.profile.theme = option.dataset.theme;
                this.elements.themeSelect.value = option.dataset.theme;
                this.updatePreview();
            });
        });
        
        // URL image modal buttons
        this.elements.closeUrlImage.addEventListener('click', () => document.getElementById('urlImageModal').style.display = 'none');
        this.elements.cancelUrlImage.addEventListener('click', () => document.getElementById('urlImageModal').style.display = 'none');
        document.getElementById('setImageUrl').addEventListener('click', () => this.setImageFromUrl());
    }

    updateProfile() {
        this.state.profile.name = this.elements.profileName.value;
        this.state.profile.bio = this.elements.profileBio.value;
        this.updatePreview();
    }

    updateTheme() {
        this.state.profile.theme = this.elements.themeSelect.value;
        document.querySelectorAll('.theme-option').forEach(opt => {
            opt.classList.toggle('active', opt.dataset.theme === this.state.profile.theme);
        });
        this.updatePreview();
    }

    async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            this.showNotification('Please select an image file', 'error');
            return;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Image size should be less than 5MB', 'error');
            return;
        }
        
        try {
            const dataUrl = await Utils.readFileAsDataURL(file);
            this.state.profile.image = dataUrl;
            this.elements.previewImage.src = dataUrl;
            this.elements.profileImagePreview.src = dataUrl;
            this.showNotification('Image uploaded successfully');
            this.saveToStorage();
        } catch (error) {
            this.showNotification('Failed to upload image', 'error');
        }
    }

    showUrlImageModal() {
        document.getElementById('urlImageModal').style.display = 'flex';
        document.getElementById('imageUrlInput').value = '';
        document.getElementById('urlPreviewImage').style.display = 'none';
    }

    setImageFromUrl() {
        const url = document.getElementById('imageUrlInput').value.trim();
        if (!url) {
            this.showNotification('Please enter an image URL', 'error');
            return;
        }
        
        if (!Utils.validateURL(url)) {
            this.showNotification('Please enter a valid URL', 'error');
            return;
        }
        
        const previewImage = document.getElementById('urlPreviewImage');
        const errorDiv = document.getElementById('urlPreviewError');
        
        previewImage.style.display = 'none';
        errorDiv.classList.add('hidden');
        
        const img = new Image();
        img.onload = () => {
            this.state.profile.image = url;
            this.elements.previewImage.src = url;
            this.elements.profileImagePreview.src = url;
            document.getElementById('urlImageModal').style.display = 'none';
            this.showNotification('Image set successfully');
            this.saveToStorage();
        };
        
        img.onerror = () => {
            errorDiv.textContent = 'Failed to load image. Please check the URL.';
            errorDiv.classList.remove('hidden');
        };
        
        img.src = url;
    }

    renderLinks() {
        this.elements.linksContainer.innerHTML = '';
        
        this.state.profile.links.forEach((link, index) => {
            const linkElement = this.createLinkElement(link, index);
            this.elements.linksContainer.appendChild(linkElement);
        });
        
        this.updateLinksCount();
    }

    createLinkElement(link, index) {
        const div = Utils.createElement('div', {
            className: 'link-item',
            'data-id': link.id
        });
        
        div.innerHTML = `
            <div class="link-header">
                <h4><i class="fas fa-link"></i> Link ${index + 1}</h4>
                <div class="link-actions">
                    <button class="btn btn-outline btn-edit" data-id="${link.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline btn-remove" data-id="${link.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            <div class="form-group">
                <input type="text" class="form-control link-name" value="${link.name}" data-id="${link.id}" placeholder="Link name">
            </div>
            <div class="form-group">
                <input type="url" class="form-control link-url" value="${link.url}" data-id="${link.id}" placeholder="https://example.com">
            </div>
            <div class="form-group">
                <select class="form-control link-icon" data-id="${link.id}">
                    ${this.getIconOptions(link.icon)}
                </select>
            </div>
        `;
        
        // Add event listeners
        div.querySelector('.link-name').addEventListener('input', (e) => this.updateLink(e));
        div.querySelector('.link-url').addEventListener('input', (e) => this.updateLink(e));
        div.querySelector('.link-icon').addEventListener('change', (e) => this.updateLink(e));
        div.querySelector('.btn-remove').addEventListener('click', (e) => this.removeLink(e));
        div.querySelector('.btn-edit').addEventListener('click', (e) => this.editLink(e));
        
        return div;
    }

    getIconOptions(selectedIcon) {
        const icons = [
            'fas fa-globe', 'fab fa-instagram', 'fab fa-youtube', 'fab fa-tiktok', 
            'fab fa-twitter', 'fab fa-facebook', 'fab fa-linkedin', 'fab fa-github',
            'fab fa-spotify', 'fab fa-discord', 'fab fa-whatsapp', 'fab fa-telegram',
            'fas fa-shopping-cart', 'fas fa-envelope', 'fas fa-calendar', 'fas fa-file-pdf',
            'fas fa-music', 'fas fa-podcast', 'fas fa-video', 'fas fa-image'
        ];
        
        return icons.map(icon => 
            `<option value="${icon}" ${icon === selectedIcon ? 'selected' : ''}>
                ${icon.replace('fas fa-', '').replace('fab fa-', '').replace('-', ' ')}
            </option>`
        ).join('');
    }

    updateLink(e) {
        const id = parseInt(e.target.dataset.id);
        const link = this.state.profile.links.find(l => l.id === id);
        
        if (e.target.classList.contains('link-name')) {
            link.name = e.target.value;
        } else if (e.target.classList.contains('link-url')) {
            link.url = e.target.value;
        } else if (e.target.classList.contains('link-icon')) {
            link.icon = e.target.value;
        }
        
        this.updatePreview();
    }

    editLink(e) {
        const id = parseInt(e.target.closest('.btn-edit').dataset.id);
        const index = this.state.profile.links.findIndex(l => l.id === id);
        
        if (index > 0) {
            const [link] = this.state.profile.links.splice(index, 1);
            this.state.profile.links.unshift(link);
            this.renderLinks();
            this.updatePreview();
            this.showNotification('Link moved to top');
        }
    }

    removeLink(e) {
        const id = parseInt(e.target.closest('.btn-remove').dataset.id);
        
        if (this.state.profile.links.length <= 1) {
            this.showNotification('You must have at least one link', 'error');
            return;
        }
        
        this.state.profile.links = this.state.profile.links.filter(l => l.id !== id);
        this.renderLinks();
        this.updatePreview();
        this.showNotification('Link removed');
    }

    addNewLink() {
        if (!this.state.isVip && this.state.profile.links.length >= 5) {
            this.showNotification('Free plan limited to 5 links. Upgrade to VIP for unlimited links.', 'error');
            this.showPaymentModal();
            return;
        }
        
        const newLink = {
            id: this.state.nextLinkId++,
            name: `Link ${this.state.profile.links.length + 1}`,
            url: 'https://example.com',
            icon: 'fas fa-globe'
        };
        
        this.state.profile.links.push(newLink);
        this.renderLinks();
        this.updatePreview();
        this.showNotification('New link added');
    }

    updateLinksCount() {
        if (!this.state.isVip && this.state.profile.links.length >= 5) {
            this.elements.addLinkBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade for more links';
            this.elements.addLinkBtn.classList.add('btn-vip');
        } else {
            this.elements.addLinkBtn.innerHTML = '<i class="fas fa-plus"></i> Add New Link';
            this.elements.addLinkBtn.classList.remove('btn-vip');
        }
    }

    updatePreview() {
        this.elements.previewName.textContent = this.state.profile.name;
        this.elements.previewBio.textContent = this.state.profile.bio;
        
        // Update preview links
        this.elements.previewLinks.innerHTML = '';
        this.state.profile.links.forEach(link => {
            const linkElement = Utils.createElement('a', {
                href: link.url,
                className: 'preview-link',
                target: '_blank'
            }, [
                Utils.createElement('i', { className: link.icon }),
                document.createTextNode(link.name),
                Utils.createElement('i', { 
                    className: 'fas fa-external-link-alt',
                    style: { marginLeft: 'auto', opacity: '0.8' }
                })
            ]);
            
            this.elements.previewLinks.appendChild(linkElement);
        });
        
        // Apply theme
        this.applyThemeToPreview();
    }

    applyThemeToPreview() {
        const themeColors = {
            default: { bg: 'var(--primary)', hover: 'var(--primary-dark)' },
            vip: { bg: 'var(--vip-gradient)', hover: 'linear-gradient(135deg, #FF9500, #FF6B00)' },
            ocean: { bg: 'linear-gradient(135deg, #00b4db, #0083b0)', hover: 'linear-gradient(135deg, #0083b0, #006a8b)' },
            sunset: { bg: 'linear-gradient(135deg, #ff7e5f, #feb47b)', hover: 'linear-gradient(135deg, #feb47b, #fd7e14)' },
            forest: { bg: 'linear-gradient(135deg, #56ab2f, #a8e063)', hover: 'linear-gradient(135deg, #a8e063, #2d8516)' }
        };
        
        const theme = themeColors[this.state.profile.theme] || themeColors.default;
        document.querySelectorAll('.preview-link').forEach(link => {
            link.style.background = theme.bg;
            link.onmouseenter = () => link.style.background = theme.hover;
            link.onmouseleave = () => link.style.background = theme.bg;
        });
    }

    updateUI() {
        if (this.state.isVip) {
            this.elements.upgradeText.textContent = 'VIP Active';
            this.elements.upgradeBtn.disabled = true;
            this.elements.freePlanBtn.textContent = 'Switch to Free';
            this.elements.vipPlanBtn.innerHTML = '<i class="fas fa-check"></i> VIP Active';
            this.elements.vipPlanBtn.disabled = true;
        } else {
            this.elements.upgradeText.textContent = 'Upgrade VIP';
            this.elements.upgradeBtn.disabled = false;
            this.elements.freePlanBtn.textContent = 'Current Plan';
            this.elements.vipPlanBtn.innerHTML = '<i class="fas fa-crown"></i> Upgrade Now';
            this.elements.vipPlanBtn.disabled = false;
        }
        
        this.updateLinksCount();
    }

    setPlan(plan) {
        if (plan === 'free' && this.state.isVip) {
            if (confirm('Switch to free plan? You will lose VIP features.')) {
                this.state.isVip = false;
                // Remove excess links if more than 5
                if (this.state.profile.links.length > 5) {
                    this.state.profile.links = this.state.profile.links.slice(0, 5);
                    this.renderLinks();
                }
                this.updateUI();
                this.saveToStorage();
                this.showNotification('Switched to free plan');
            }
        } else if (plan === 'vip' && !this.state.isVip) {
            this.showPaymentModal();
        }
    }

    showPaymentModal() {
        document.getElementById('paymentModal').style.display = 'flex';
    }

    showExportModal() {
        document.getElementById('exportModal').style.display = 'flex';
    }

    generateHTML() {
        // This will be handled by the export module
        if (typeof ExportModule !== 'undefined') {
            ExportModule.generateHTML(this.state);
        }
    }

    showNotification(message, type = 'success') {
        this.elements.notificationText.textContent = message;
        this.elements.notification.className = 'notification show';
        
        let icon = 'fa-check';
        if (type === 'error') {
            this.elements.notification.style.background = 'var(--danger)';
            icon = 'fa-exclamation-circle';
        } else if (type === 'warning') {
            this.elements.notification.style.background = 'var(--warning)';
            icon = 'fa-exclamation-triangle';
        } else {
            this.elements.notification.style.background = 'var(--success)';
            icon = 'fa-check';
        }
        
        this.elements.notificationIcon.className = `fas ${icon}`;
        
        setTimeout(() => {
            this.elements.notification.classList.remove('show');
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new LinkTreeApp();
});
