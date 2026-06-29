(function() {

  const init = () => {
    const article = document.getElementById("single-article");
    const tocContainer = document.getElementById("toc");

    if (!tocContainer || !article) return;

    const headings = article.querySelectorAll("h1, h2, h3, h4, h5, h6");
    if (headings.length === 0) return;

    const slugCounts = {};

    function createAnchorId(heading) {
      const existingId = heading.getAttribute("id");
      if (existingId) return existingId;

      const baseSlug = heading.textContent
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") || "heading";

      slugCounts[baseSlug] = (slugCounts[baseSlug] || 0) + 1;
      return slugCounts[baseSlug] === 1 ? `toc-${baseSlug}` : `toc-${baseSlug}-${slugCounts[baseSlug]}`;
    }

    const tocFragment = document.createDocumentFragment();
    headings.forEach((heading) => {
      const title = heading.textContent.trim();
      if (!title) return;

      const anchorId = createAnchorId(heading);
      const headingLevel = heading.tagName.toLowerCase();
      heading.id = anchorId;
      const li = document.createElement("li");
      li.classList.add(`toc-item-${headingLevel}`);
      const anchor = document.createElement("a");
      anchor.textContent = title;
      anchor.href = `#${anchorId}`;
      li.appendChild(anchor);
      tocFragment.appendChild(li);
    });
    const ul = document.createElement("ul");
    ul.appendChild(tocFragment);
    tocContainer.appendChild(ul);

    const tocItems = tocContainer.querySelectorAll('a');

    function setActiveItem(targetId) {
      tocItems.forEach(function(item) {
        if (item.getAttribute('href') === '#' + targetId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    tocItems.forEach(function(item) {
      item.addEventListener('click', function(event) {
        event.preventDefault();
        var targetId = this.getAttribute('href').substring(1);
        var targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        setActiveItem(targetId);
        targetElement.scrollIntoView();
      });
    });

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute("id");
          setActiveItem(id);
        }
      });
    }, { rootMargin: '0px 0px -50% 0px' });

    headings.forEach(function(heading) {
      observer.observe(heading);
    });

    function offsetAnchor() {
      if (location.hash.length !== 0) {
        const targetId = location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const offset = targetElement.getBoundingClientRect().top - 100;
          window.scrollTo(window.scrollX, window.scrollY + offset);
        }
      }
    }
    window.addEventListener("hashchange", offsetAnchor);
    window.setTimeout(offsetAnchor, 1);
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(init);
  } else {
    setTimeout(init, 200);
  }

})();
