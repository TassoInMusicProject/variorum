import * as Handlebars from 'handlebars';

let TEImetadata_tpl = `
<h2 class="worktitle">{{title}}</h2>
<ul class="TEImetadata list-unstyled">
  {{#if ms}}
  	<li>{{ms.idno}}</li>
  	<li>{{ms.repository}}, {{ms.settlement}} {{ms.region}}</li>
  	<li>{{ms.origDate}}</li>
    <li>{{ms.locus}}</li>
  {{/if}}
  {{#if print}}
  	<li><em>{{print.title}}</em></li>
  	{{#if print.author}}<li>{{print.author}}</li>{{/if}}
  	<li>{{print.publisher}}, {{print.pubPlace}} {{print.region}}</li>
  	<li>{{print.date}}</li>
  	{{#if print.idno}}<li>RISM: {{print.idno}}</li>{{/if}}
    {{#if print.biblScope}}<li>p. {{print.biblScope}}</li>{{/if}}
  {{/if}}
</ul>`

export default Handlebars.compile(TEImetadata_tpl);
