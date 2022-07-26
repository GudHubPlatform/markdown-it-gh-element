import markdownIt from 'markdown-it';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import 'highlight.js/styles/github.css'
import '../scss/style.scss';

/********************* EDITOR JS WEB COMPONENT CREATING *********************/
class MarkdownViewerWeb extends HTMLElement {
  constructor() {
    super();
    this.appId;
    this.itemId;
    this.fieldId;
    this.fieldValue;
  }
  /********************* GET ATTRIBUTES *********************/
  // Getting attributes from component's data attributes
  getAttributes() {
    this.appId = this.getAttribute('app-id');
    this.itemId = this.getAttribute('item-id');
    this.fieldId = this.getAttribute('field-id');
    this.fieldValue = this.getAttribute('field-value');
  }
  /********************* OBSERVED ATTRIBUTES *********************/
  // Adding listeners to component's data attributes
  static get observedAttributes() {
    return ['app-id'];
  }
  /********************* ATTRIBUTE CHANGED CALLBACK*********************/
  // We init editor only after attributes change
  // We are doing it, instead of connedctedCallback to get right data
  // Usgin connectedCallback we are always receiving not ready data like this - {{appId}}
  attributeChangedCallback(name, oldValue, newValue) {
    if (name == 'app-id' && newValue.indexOf('{{') == -1) {
      setTimeout(() => {
        this.getAttributes();
        this.init();
      }, 0);
    }
  }
  /********************* INIT *********************/
  // Checks if document exists for this field, if yes - download it
  init() {
    this.innerHTML += /*html*/`
      <input class="input input-${this.fieldId}" type="text" name="mdLink" placeholder="Type value">
      <div class="md-output component-${this.fieldId} markdown-body"></div>
      `;
    this.initEventListeners()
    this.render()
  }
  /********************* GET MD DATA *********************/
  // This method get a link from input tag, fetch this link and return content of markdown like a text
  async getMdData(link) {
    let response = await fetch(link);
    let mdMarkup = await response.text();
    return mdMarkup;
  }
  /********************* RENDER *********************/
  // Get the markdown data from the link and convert it to html
  // Then we use innerHTML to paste markdown markup to our block
  async render(){
    let markdown = new markdownIt().use(markdownItHighlightjs);
    let markdownLink = await gudhub.getFieldValue(this.appId, this.itemId, this.fieldId, this.fieldValue);
    let mdData = await this.getMdData(markdownLink);
    let mdHTML = markdown.render(mdData);

    document.querySelector(`div.component-${this.fieldId}`).innerHTML = mdHTML;
    document.querySelector(`input.input-${this.fieldId}`).value = markdownLink;
  }

  /********************* INIT EVENT LISTENERS *********************/
  // Create eventListener with a trigger on a change input tag
  // Start mathod "render" to update content
  async initEventListeners(){
    this.addEventListener('change', async (event) => {
      let md = event.path[0].value;
      this.field_value = md;
      await gudhub.setFieldValue(this.appId, this.itemId, this.fieldId, this.field_value);
      this.render();
    });
  }
}
if (!window.customElements.get('markdown-viewer')) {
  window.customElements.define('markdown-viewer', MarkdownViewerWeb);
}