document.addEventListener('DOMContentLoaded', function () {
  var input = document.getElementById('search-input');
  var posts = document.querySelectorAll('#sidebar-post-list li');
  var noResults = document.getElementById('no-results');

  if (!input) return;

  input.addEventListener('input', function () {
    var query = this.value.toLowerCase().trim();
    var visible = 0;

    posts.forEach(function (li) {
      var title = li.getAttribute('data-title') || '';
      var cve = li.getAttribute('data-cve') || '';
      var tags = li.getAttribute('data-tags') || '';
      var text = title + ' ' + cve + ' ' + tags;

      if (!query || text.indexOf(query) !== -1) {
        li.style.display = '';
        visible++;
      } else {
        li.style.display = 'none';
      }
    });

    if (noResults) {
      noResults.style.display = (visible === 0 && query) ? 'block' : 'none';
    }
  });
});

// Mobile sidebar toggle
function toggleSidebar() {
  var sidebar = document.querySelector('.sidebar');
  var overlay = document.querySelector('.sidebar-overlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('active');
}
