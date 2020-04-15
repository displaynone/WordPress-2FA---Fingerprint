import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import WebAuthn from '../services/webauthn';
import WebauthnIcon from '../icons/webauthn';
import CredentialsList from './credentials_list';

export default class Main extends Component {
	render() {
		const webauthn = new WebAuthn();
		return (
			<div className="wrap">
				<h2>{ __( 'WebAuthn - 2FA Settings', 'sw-2fa' ) }</h2>
				<p>{ __( 'Here you can configure the extra security layer for your site. There are 2 types of authentication:', 'sw-2fa' ) }</p>
				<CredentialsList />
				<div className="sw-options__container">
					<p><WebauthnIcon /></p>
					<p>{ __( 'Create a new public credential using WebAuthn', 'sw-2fa' ) }</p>
					<p>
						<button
							className="button button-primary button-hero"
							onClick={ () => webauthn.register() }
						>
							{ __( 'Create', 'sw-2fa' ) }
						</button>
						<button
							className="button button-primary button-hero"
							onClick={ () => webauthn.authenticate() }
						>
							{ __( 'Authenticate', 'sw-2fa' ) }
						</button>
					</p>
				</div>
			</div>
		);
	}
}
