{{#if value}}
    {{{value}}}
{{else}}
    {{#if valueIsSet}}
    {{{translate 'None'}}}
    {{else}}<img src="https://via.placeholder.com/150" data-action="showWbPreview">
    <div class="attachment"></div>{{/if}}
{{/if}}