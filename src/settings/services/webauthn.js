import CBOR from '../../lib/cbor';

import { parseAuthData, bufToHex } from '../../lib/webauthn/helper';

const {
	atob,
	btoa,
	crypto,
	fetch,
	Headers,
	navigator,
	Uint8Array,
} = window;

/**
 * Class that handles WebAuthn registering
 */
export default class WebAuthn {
	register() {
		const challenge = new Uint8Array( 32 );
		crypto.getRandomValues( challenge );

		const userID = btoa( sentidoweb.user.id );
		const id = Uint8Array.from( atob( userID ), c => c.charCodeAt( 0 ) );

		const publicKey = {
			challenge: challenge,

			rp: {
				name: sentidoweb.site.name,
			},

			user: {
				id: id,
				name: sentidoweb.user.email,
				displayName: sentidoweb.user.username,
			},

			pubKeyCredParams: [
				{ type: 'public-key', alg: -7 },
				{ type: 'public-key', alg: -257 },
			],
		};

		navigator.credentials.create( { publicKey } )
			.then( newCredentialInfo => {
				const headers = new Headers(
					{
						'Content-Type': 'application/x-www-form-urlencoded',
					}
				);
				const credential = {};
				if ( !! newCredentialInfo.id ) {
					credential.id = newCredentialInfo.id;
				}
				if ( !! newCredentialInfo.type ) {
					credential.type = newCredentialInfo.type;
				}
				if ( ! newCredentialInfo.response ) {
					console.error( 'Missing credential response' ); // eslint-disable-line
					return;
				}
				const attestationBuffer = CBOR.decode( newCredentialInfo.response.attestationObject );
				const authData = parseAuthData( attestationBuffer.authData );
				credential.authData = {
					credentialID: bufToHex( authData.credID ),
					aaguid: bufToHex( authData.aaguid ),
					publicKey: CBOR.decode( authData.COSEPublicKey.buffer ),
				};

				console.log(credential);

				const params = {
					action: sentidoweb.actions.webauthn.addCredential,
					credential: JSON.stringify( credential ),
					nonce: sentidoweb.nonce,
				};
				fetch( sentidoweb.ajaxurl, {
					method: 'POST',
					body: Object.keys( params ).map( key => key + '=' + params[ key ] ).join( '&' ),
					headers,
					credentials: 'same-origin',
				} )
					.then( response => response.json() )
					.then( data => {
						console.log( data );
					} );
			} )
			.catch( error => {
				console.log( 'FAIL', error ); // eslint-disable-line
			} );
	}

	authenticate() {
		const publicKeyCredentialRequestOptions = {
			challenge: Uint8Array.from(
				sentidoweb.user.id, c => c.charCodeAt( 0 ) ),
			allowCredentials: [ {
				id: Uint8Array.from(
					sentidoweb.user.credentials[ 'd87e9626-340a-486a-99ce-9fb83ba31b55' ].credentialID, c => c.charCodeAt( 0 ) ),
				type: 'public-key',
				transports: [ 'usb', 'ble', 'nfc', 'internal' ],
			} ],
			timeout: 60000,
		};
		console.warn(publicKeyCredentialRequestOptions);

		navigator.credentials.get( {
			publicKey: publicKeyCredentialRequestOptions,
		} ).then( response => {
			console.log( response );
		} );
	}
}
