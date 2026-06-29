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

    const tocHeadings = [];
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
      tocHeadings.push(heading);
    });

    if (tocHeadings.length === 0) return;

    const ul = document.createElement("ul");
    ul.appendChild(tocFragment);
    tocContainer.appendChild(ul);

    const tocItems = tocContainer.querySelectorAll('a');
    const scrollOffset = 120;

    function setActiveItem(targetId) {
      tocItems.forEach(function(item) {
        if (item.getAttribute('href') === '#' + targetId) {
          item.classList.add('active');
        } else {
          item.classList.remove('active');
        }
      });
    }

    function scrollToHeading(targetElement, behavior) {
      const targetTop = targetElement.getBoundingClientRect().top + window.scrollY - scrollOffset;

      window.scrollTo({
        top: Math.max(targetTop, 0),
        behavior: behavior || "smooth"
      });
    }

    function getHeadingTop(heading) {
      return heading.getBoundingClientRect().top + window.scrollY;
    }

    function scrollToHeadingWithCorrection(targetId, targetElement) {
      setActiveItem(targetId);
      scrollToHeading(targetElement);

      window.setTimeout(function() {
        scrollToHeading(targetElement, "auto");
        setActiveItem(targetId);
      }, 50);

      window.setTimeout(function() {
        scrollToHeading(targetElement, "auto");
        setActiveItem(targetId);
      }, 250);
    }

    tocItems.forEach(function(item) {
      item.addEventListener('click', function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (event.stopImmediatePropagation) event.stopImmediatePropagation();

        var targetId = this.getAttribute('href').substring(1);
        var targetElement = document.getElementById(targetId);
        if (!targetElement) return;

        scrollToHeadingWithCorrection(targetId, targetElement);
      }, true);
    });

    function updateActiveItem() {
      var scrollPosition = window.scrollY + scrollOffset;
      var activeHeading = tocHeadings[0];

      if (window.scrollY <= getHeadingTop(tocHeadings[0])) {
        setActiveItem(activeHeading.getAttribute("id"));
        return;
      }

      tocHeadings.forEach(function(heading) {
        if (getHeadingTop(heading) <= scrollPosition) {
          activeHeading = heading;
        }
      });

      setActiveItem(activeHeading.getAttribute("id"));
    }

    var ticking = false;
    function requestActiveUpdate() {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(function() {
        updateActiveItem();
        ticking = false;
      });
    }

    updateActiveItem();
    window.addEventListener("scroll", requestActiveUpdate, { passive: true });
    window.addEventListener("resize", requestActiveUpdate);
    window.addEventListener("load", requestActiveUpdate);

    function offsetAnchor() {
      if (location.hash.length !== 0) {
        const targetId = location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          scrollToHeading(targetElement, "auto");
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
