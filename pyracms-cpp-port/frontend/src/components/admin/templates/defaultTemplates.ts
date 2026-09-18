export type TemplateSection =
  | 'header' | 'footer' | 'sidebar' | 'layout'

export type Templates = Record<TemplateSection, string>

const HEADER = [
  '<header>',
  '  <nav>',
  '    <div class="brand"><a href="/">PyraCMS</a></div>',
  '    <ul class="nav-links">',
  '      <li><a href="/articles">Articles</a></li>',
  '      <li><a href="/forum">Forum</a></li>',
  '      <li><a href="/snippets">Snippets</a></li>',
  '    </ul>',
  '  </nav>',
  '</header>',
].join('\n')

const FOOTER = [
  '<footer>',
  '  <div class="footer-content">',
  '    <p>Powered by PyraCMS</p>',
  '    <nav>',
  '      <a href="/about">About</a>',
  '      <a href="/contact">Contact</a>',
  '      <a href="/privacy">Privacy</a>',
  '    </nav>',
  '  </div>',
  '</footer>',
].join('\n')

const SIDEBAR = [
  '<aside>',
  '  <div class="widget">',
  '    <h3>Recent Articles</h3>',
  '    <ul>',
  '      <li><a href="#">Getting Started</a></li>',
  '      <li><a href="#">Configuration Guide</a></li>',
  '    </ul>',
  '  </div>',
  '  <div class="widget">',
  '    <h3>Categories</h3>',
  '    <ul>',
  '      <li><a href="#">Tutorials</a></li>',
  '      <li><a href="#">News</a></li>',
  '    </ul>',
  '  </div>',
  '</aside>',
].join('\n')

const LAYOUT = [
  '<div class="site-layout">',
  '  <div class="main-content">',
  '    <main>',
  '      <!-- Page content renders here -->',
  '    </main>',
  '  </div>',
  '</div>',
].join('\n')

export const DEFAULT_TEMPLATES: Templates = {
  header: HEADER,
  footer: FOOTER,
  sidebar: SIDEBAR,
  layout: LAYOUT,
}
