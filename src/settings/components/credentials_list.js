import { Component } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const { sentidoweb } = window;

const credentialNames = {
	webauthn: __( 'WebAuthn', 'sw-2fa' ),
};

export default class CredentialsList extends Component {
	getCredentialName( type ) {
		if ( !! credentialNames[ type ] ) {
			return credentialNames[ type ];
		}
		return __( 'Others', 'sw-2fa' );
	}
	item( key, credential ) {
		return (
			<tr key={ key }>
				<th scope="row">{ this.getCredentialName( credential.type ) }</th>
				<td>{ credential.name } </td>
			</tr>

		);
	}

	render() {
		const { credentials } = sentidoweb.user;
		const credentialKeys = Object.keys( credentials || {} );
		return (
			<table className="form-table">
				<tbody>
					{
						! credentialKeys.length &&
						__( 'No credentials yet', 'sw-2fa' )
					}
					{
						credentialKeys.length &&
						[ ... credentialKeys
							.map( credentialKey => this.item( credentialKey, credentials[ credentialKeys ] ) )
						]
					}
				</tbody>
			</table>
		);
	}
}
