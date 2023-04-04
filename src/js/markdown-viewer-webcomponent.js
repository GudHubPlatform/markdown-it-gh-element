import { GhHtmlElement } from '@gudhub/gh-html-element/src/GhHtmlElement.js';
import markdownIt from 'markdown-it';
import markdownItHighlightjs from 'markdown-it-highlightjs';
import 'highlight.js/styles/github.css'
import '../scss/style.scss';

/********************* Open all MD links in new tab *********************/
const markdown = new markdownIt({html: true}).use(markdownItHighlightjs);
var defaultRender = markdown.renderer.rules.link_open || function(tokens, idx, options, env, self) {
  return self.renderToken(tokens, idx, options);
};

markdown.renderer.rules.link_open = function (tokens, idx, options, env, self) {
  var aIndex = tokens[idx].attrIndex('target');

  if (aIndex < 0) {
    tokens[idx].attrPush(['target', '_blank']); // add new attribute
  } else {
    tokens[idx].attrs[aIndex][1] = '_blank';    // replace value of existing attr
  }

  // pass token to default renderer
  return defaultRender(tokens, idx, options, env, self);
};

/********************* EDITOR JS WEB COMPONENT CREATING *********************/
class MarkdownViewerWeb extends GhHtmlElement {
  constructor() {
    super();
    this.appId;
    this.itemId;
    this.fieldId;
    this.fieldValue;
    this.mode;

    // Observe md variable for getting it and render in component
    this.observe('md', () => {
      this.renderHTML();
    })
  }
  /********************* GET ATTRIBUTES *********************/
  // Getting attributes from component's data attributes
  getAttributes() {
    this.appId = this.getAttribute('app-id');
    this.itemId = this.getAttribute('item-id');
    this.fieldId = this.getAttribute('field-id');
    this.fieldValue = this.getAttribute('field-value');
    this.mode = this.getAttribute('mode');
  }
  /********************* OBSERVED ATTRIBUTES *********************/
  // Adding listeners to component's data attributes
  static get observedAttributes() {
    return ['app-id', 'mode'];
  }
  /********************* ATTRIBUTE CHANGED CALLBACK*********************/
  // We init editor only after attributes change
  // We are doing it, instead of connedctedCallback to get right data
  // Usgin connectedCallback we are always receiving not ready data like this - {{appId}}
  attributeChangedCallback(name, oldValue, newValue) {
    if ((name == 'app-id' && newValue.indexOf('{{') == -1) || name == 'mode') {
      setTimeout(() => {
        this.getAttributes();
        if(!this.mode) {
          this.init();
        }
      }, 0);
    }
  }
  /********************* INIT *********************/
  // Checks if document exists for this field, if yes - download it
  init() {
    this.innerHTML += /*html*/`
      <input class="input" type="text" name="mdLink" placeholder="Type value">
      <div class="md-output component markdown-body"></div>
      `;
    this.initEventListeners()
    this.render()
  }

  /********************* RENDER HTML *********************/
  // Get MD from getter and render it as HTML
  renderHTML() {
    const md = this.data.md.replaceAll('&gt;', '>'); // replace encoded > symbol for correct showing blockquote in markdown render lib
    const html = markdown.render(md);
    this.innerHTML = /*html*/`
      <div class="md-component md-body markdown-body"></div>`;
      this.querySelector(`.md-component`).innerHTML = html;
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
    let markdownLink = await gudhub.getFieldValue(this.appId, this.itemId, this.fieldId);
    if(!markdownLink) return;
    let mdData = await this.getMdData(markdownLink);
    let mdHTML = markdown.render(mdData);

    this.querySelector(`.component`).innerHTML = mdHTML;
    this.querySelector(`.input`).value = markdownLink;
  }

  /********************* INIT EVENT LISTENERS *********************/
  // Create eventListener with a trigger on a change input tag
  // Start mathod "render" to update content
  async initEventListeners(){
    this.addEventListener('change', async (event) => {
      let md = event.target.value;
      this.field_value = md;
      await gudhub.setFieldValue(this.appId, this.itemId, this.fieldId, this.field_value);
      this.render();
    });
  }
}
if (!window.customElements.get('markdown-viewer')) {
  window.customElements.define('markdown-viewer', MarkdownViewerWeb);
}