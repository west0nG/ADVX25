document.addEventListener('DOMContentLoaded', () => {
    const headerPlaceholder = document.getElementById('header-placeholder');
    if (headerPlaceholder) {
        fetch('/components/header.html')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Could not load header');
                }
                return response.text();
            })
            .then(data => {
                headerPlaceholder.innerHTML = data;
                // Once header is loaded, wait for wallet service to be ready,
                // then update the UI. This prevents the "flicker" of the connect button.
                if (window.authManager && window.walletService) {
                    window.walletService.ensureReady().then(() => {
                        window.authManager.updateGlobalUI(window.walletService.getConnectionInfo());
                        // Add class to body to fade in the wallet UI smoothly
                        document.body.classList.add('wallet-state-initialized');
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching header:', error);
                headerPlaceholder.innerHTML = '<p style="color: red; text-align: center;">Error loading header.</p>';
            });
    }
}); 