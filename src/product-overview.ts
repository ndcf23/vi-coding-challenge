import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";

/**
 * Product Overview element.
 *
 * Fetches and displays a list of Products (in this case, Pocket Monsters) from  PokeAPI.
 */

@customElement("product-overview")
export class ProductOverview extends LitElement {
  @property({ type: String })
  headline = "";

  @property({ type: Number })
  numberOfItems = 150;

  @property({ type: Object })
  allProducts: any = null;

  @property({ type: Boolean })
  fetching = true;

  @property({ type: Object })
  error: any = null;

  selectedTypes: Set<string> = new Set();

  connectedCallback() {
    super.connectedCallback();
    this.fetchData();
  }

  // Fetches the list of products (pocket monsters) from the PokeAPI
  async fetchData() {
    try {
      let r = await fetch(
        `https://pokeapi.co/api/v2/pokemon/?limit=${this.numberOfItems}`,
      );
      if (!r.ok) {
        throw new Error(`API Error: ${r.status}`);
      }
      const data = await r.json();

      // Fetch sprite data for each item
      const resultsAdditionalInfo = await Promise.all(
        data.results.map(async (item: any) => {
          try {
            const detailResponse = await fetch(item.url);
            if (detailResponse.ok) {
              const detailData = await detailResponse.json();
              return {
                ...item,
                spriteUrl:
                  detailData.sprites?.other?.["official-artwork"]
                    ?.front_default || null,
                types: detailData.types?.map((t: any) => t.type.name) || [],
              };
            }
          } catch (e) {
            console.error(`Failed to fetch sprite for ${item.name}`, e);
          }
          return item;
        }),
      );

      this.allProducts = { ...data, results: resultsAdditionalInfo };

      // Initialize selectedTypes with all types on first load
      if (this.selectedTypes.size === 0) {
        Object.keys(ProductOverview.typeColours).forEach((type) => {
          this.selectedTypes.add(type);
        });
        this.requestUpdate();
      }
    } catch (e) {
      this.error = e;
    }
    this.fetching = false;
  }

  // Defines color codes for each available type
  static typeColours = {
    normal: "#A8A77A",
    fire: "#EE8130",
    water: "#6390F0",
    electric: "#F7D02C",
    grass: "#7AC74C",
    ice: "#96D9D6",
    fighting: "#C22E28",
    poison: "#A33EA1",
    ground: "#E2BF65",
    flying: "#A98FF3",
    psychic: "#F95587",
    bug: "#A6B91A",
    rock: "#B6A136",
    ghost: "#735797",
    dragon: "#6F35FC",
    dark: "#705746",
    steel: "#B7B7CE",
    fairy: "#D685AD",
  };

  // Get color for a given type from the typeColours object above
  getTypeColor(type: string): string {
    return (
      ProductOverview.typeColours[
        type as keyof typeof ProductOverview.typeColours
      ] || "#A8A77A"
    );
  }

  // Get a list of all available types from the typeColours object
  getAllTypes(): string[] {
    return Object.keys(ProductOverview.typeColours);
  }

  // Filters the list of allProducts based on the selected types
  getFilteredResults(): any[] {
    if (!this.allProducts?.results || this.selectedTypes.size === 0) {
      return this.allProducts?.results || [];
    }
    return this.allProducts.results.filter((item: any) => {
      const itemTypes = item.types || [];
      return itemTypes.some((type: string) => this.selectedTypes.has(type));
    });
  }

  // Toggles the selection of a type filter in the selectedTypes Set above, when the user interacts with the checkbox
  toggleTypeFilter(type: string): void {
    if (this.selectedTypes.has(type)) {
      this.selectedTypes.delete(type);
    } else {
      this.selectedTypes.add(type);
    }
    this.requestUpdate();
  }

  render() {
    if (this.error) {
      return html`<div class="error">${this.error.message}</div>`;
    }
    if (this.fetching) {
      return html`<div class="loading">Loading the Pocket Monsters...</div>`;
    }

    const filteredResults = this.getFilteredResults();

    return html`
      <div class="page-container">
        <aside class="filter-panel">
          <div class="panel-header">
            <h2>Filter by Type</h2>
          </div>
          <div class="type-list">
            ${this.getAllTypes().map(
              (type: string) => html`
                <label class="type-checkbox">
                  <input
                    type="checkbox"
                    ?checked=${this.selectedTypes.has(type)}
                    @change=${() => this.toggleTypeFilter(type)}
                  />
                  <span
                    class="type-circle"
                    style="background-color: ${this.getTypeColor(type)}"
                  ></span>
                  <span class="type-name">${type}</span>
                </label>
              `,
            )}
          </div>
        </aside>

        <main class="main-content">
          <div class="products-wrapper">
            ${this.headline
              ? html`<h1 class="headline">${this.headline}</h1>`
              : ""}
            <div class="grid-container">
              ${filteredResults.map(
                (item: any) => html`
                  <a
                    href="#"
                    target="_blank"
                    class="grid-item"
                    style="--primary-type-color: ${this.getTypeColor(
                      item.types?.[0] || "normal",
                    )}"
                  >
                    <div class="sprite">
                      ${item.spriteUrl
                        ? html`<img
                            src="${item.spriteUrl}"
                            alt="${item.name} sprite"
                          />`
                        : html`<span>No sprite</span>`}
                    </div>
                    <div class="item-info">
                      <h2>${item.name}</h2>
                      <div class="types">
                        ${(item.types || []).map(
                          (type: string) => html`
                            <span
                              class="type-indicator"
                              data-type="${type}"
                              style="background-color: ${this.getTypeColor(
                                type,
                              )}"
                            ></span>
                          `,
                        )}
                      </div>
                    </div>
                  </a>
                `,
              )}
            </div>
          </div>
        </main>
      </div>
    `;
  }

  static styles = css`
    :host {
      --text: #6b6375;
      --text-h: #08060d;
      --bg: #fff;
      --border: #e5e4e7;
      --shadow:
        rgba(0, 0, 0, 0.1) 0 10px 15px -3px, rgba(0, 0, 0, 0.05) 0 4px 6px -2px;

      --sans: system-ui, "Segoe UI", Roboto, sans-serif;
      --heading: system-ui, "Segoe UI", Roboto, sans-serif;
      --mono: ui-monospace, Consolas, monospace;

      font-family: var(--sans);
      width: 1126px;
      max-width: 100%;
      margin: 0 auto;
      padding: 32px;
      box-sizing: border-box;
      text-align: center;
      min-height: 100svh;
      display: flex;
      flex-direction: column;
      color: var(--text);
      background-color: var(--bg);
      position: relative;
    }

    .page-container {
      display: flex;
      gap: 24px;
      flex: 1;
      position: relative;
    }

    .filter-panel {
      width: 250px;
      background: var(--bg);
      border-right: 1px solid var(--border);
      padding: 20px;
      box-sizing: border-box;
      overflow-y: auto;
      max-height: 100%;
    }

    .panel-header {
      margin-bottom: 20px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 12px;
    }

    .panel-header h2 {
      margin: 0;
      font-size: 18px;
      text-align: left;
    }

    .type-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .type-checkbox {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      user-select: none;
    }

    .type-checkbox input {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .type-circle {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: inline-block;
    }

    .type-name {
      font-size: 14px;
      font-weight: 500;
      text-transform: capitalize;
    }

    .main-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    @media (prefers-color-scheme: dark) {
      :host {
        --text: #9ca3af;
        --text-h: #f3f4f6;
        --bg: #16171d;
        --border: #2e303a;
        --shadow:
          rgba(0, 0, 0, 0.4) 0 10px 15px -3px,
          rgba(0, 0, 0, 0.25) 0 4px 6px -2px;
      }
    }

    h1,
    h2,
    h3 {
      font-family: var(--heading);
      font-weight: 500;
      color: var(--text-h);
    }

    h1 {
      font-size: 46px;
      margin: 32px 0;
    }

    h2 {
      font-size: 24px;
      line-height: 118%;
      letter-spacing: -0.24px;
      margin: 0 0 8px;
    }

    h3 {
      font-size: 16px;
      margin: 8px 0 0;
    }

    p {
      margin: 0;
    }

    .error {
      padding: 32px;
      text-align: center;
      color: #dc2626;
      background: rgba(220, 38, 38, 0.1);
      border-radius: 8px;
      margin: 32px 0;
    }

    @media (prefers-color-scheme: dark) {
      .error {
        color: #fca5a5;
      }
    }

    .loading {
      padding: 32px;
      text-align: center;
      color: var(--text);
      font-size: 18px;
    }

    .products-wrapper {
      display: flex;
      flex-direction: column;
      width: 100%;
    }

    .headline {
      margin: 10px 0;
    }

    .grid-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 24px;
      width: 100%;
      margin: 0 auto;
    }

    .grid-item {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border: 1px solid var(--border);
      border-radius: 8px;
      background: var(--bg);
      transition:
        box-shadow 0.5s,
        border-color 0.5s;
      box-sizing: border-box;
      text-decoration: none;
    }

    .grid-item:hover {
      border-color: var(--primary-type-color, var(--accent));
      box-shadow: var(--shadow);
    }

    .sprite {
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--text);
      font-size: 12px;
    }

    .sprite img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 8px;
    }

    .grid-item h2 {
      margin: 0;
      text-align: center;
      word-break: break-word;
      text-transform: capitalize;
    }

    .item-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .types {
      display: flex;
      gap: 6px;
      justify-content: center;
      flex-wrap: wrap;
    }

    .type-indicator {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 4px 10px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: capitalize;
      color: var(--text-h);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
      min-width: 40px;
      white-space: nowrap;
      cursor: pointer;
    }

    .type-indicator::before {
      content: attr(data-type);
      position: absolute;
      top: -200%;
      left: 50%;
      transform: translateX(-50%);
      background-color: var(--bg);
      color: var(--text-h);
      padding: 6px 10px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition:
        opacity 0.5s,
        top 0.5s;
      margin-bottom: 8px;
      z-index: 10;
    }

    .type-indicator:hover::before {
      opacity: 1;
      top: 100%;
    }

    @media (max-width: 1024px) {
      :host {
        font-size: 16px;
        width: 100%;
        max-width: 100%;
        padding: 20px;
      }

      .page-container {
        gap: 0;
      }

      h1 {
        font-size: 36px;
        margin: 20px 0;
      }

      h2 {
        font-size: 20px;
      }

      .grid-container {
        grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
        gap: 16px;
      }

      .grid-item {
        padding: 12px;
        gap: 8px;
      }

      .sprite {
        aspect-ratio: 1;
      }

      .grid-item h2 {
        font-size: 14px;
      }

      .type-indicator {
        font-size: 9px;
        padding: 3px 8px;
      }
    }

    @media (max-width: 640px) {
      .grid-container {
        grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
        gap: 12px;
      }

      .grid-item {
        padding: 8px;
        gap: 6px;
      }

      .grid-item h2 {
        font-size: 12px;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "product-overview": ProductOverview;
  }
}
