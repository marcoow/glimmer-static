import Component, { tracked } from '@glimmer/component';
import Navigo from 'navigo';

export default class GlimmerStatic extends Component {
  private router: Navigo;

  @tracked
  private activeComponent: string;

  constructor(options) {
    super(options);

    this._setupRouting();
    this._bindInternalLinks();
  }

  private _setupRouting() {
    this.router = new Navigo(window.location.origin);

    this.router
      .on('/', () => this.activeComponent = null)
      .on('/a', () => this.activeComponent = 'ComponentA')
      .on('/b', () => this.activeComponent = 'ComponentB')
      .on('/c', () => this.activeComponent = 'ComponentC')
      .resolve(window.location.pathname);
  }

  private _bindInternalLinks() {
    document.addEventListener('click', (event: Event) => {
      const target = event.target as HTMLElement;

      if (target.tagName === 'A' && target.dataset.navigo !== undefined) {
        event.preventDefault();
        this.router.navigate(target.getAttribute('href'));
      }
    });
  }
}
