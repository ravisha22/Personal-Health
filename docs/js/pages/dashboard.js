// Dashboard — redirects to Today page
(function() {
    App.register('dashboard', {
        render: function() {
            window.location.hash = '#/today';
            return '<div class="page"><p>Redirecting...</p></div>';
        },
        afterRender: function() {}
    });
})();
