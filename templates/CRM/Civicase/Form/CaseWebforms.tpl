<p>
    {if $errorMsg}
        {$errorMsg}
    {else}
        Select Drupal Webforms which should be linked from case view page.
    {/if}
</p>
<table style="width: 100%">
    {assign var="x" value=0}
    {foreach from=$nids item=row}
        {if $x mod 2 eq 1}
            <tr style="background-color: #E6E6DC;">
                {else}
            <tr style="background-color: #FFFFFF;">
        {/if}
        <td>{$form.$row.label}</td>
        <td>{$form.$row.html}</td>
        </tr>
        {assign var="x" value=$x+1}
    {/foreach}
</table>
<div class="crm-submit-buttons">{include file="CRM/common/formButtons.tpl" location="bottom"}</div>
