<?php
/**
 * Admin options template
 *
 * @since 1.0.0
 * @package SentidoWeb\WebAuthn2FA*
 */

?>
<div class="wrap">
	<h2><?php esc_html_e( 'WebAuthn - 2FA Settings', 'sw-2fa' ); ?></h2>
	<p><?php esc_html_e( 'Here you can configure the extra security layer for your site. There are 2 types of authentication:', 'sw-2fa' ); ?></p>
	<table class="form-table">
		<tbody>
			<tr>
				<th scope="row"><label for="input_id">WebAuthn</label></th>
				<td>
					<div class="sw-options__container">
						<p><img src="<?php echo esc_attr( SENTIDOWEB_WEBAUTHN_2FA_URL . '/assets/icons/webauthn.svg' ); ?>" alt="<?php esc_attr_e( 'WebAuthn', 'sw-2fa' ); ?>" /></p>
						<p><?php esc_html_e( 'Create a new public credential using WebAuthn', 'sw-2fa' ); ?></p>
						<p><button id="sw-webauthn" class="button button-primary button-hero">Create</button></p>
					</div>
				</td>
			</tr>
		</tbody>
	</table>
</div>
