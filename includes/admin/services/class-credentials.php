<?php
/**
 * WebAuthn
 *
 * @since 1.0.0
 *
 * @package SentidoWeb\WebAuthn2FA
 */

namespace SentidoWeb\WebAuthn2FA\Admin\Services;

// Abort if this file is called directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Main credentials Service
 */
class Credentials {
	const NONCE_KEY     = 'register_webauthn_credential';
	const USER_META_KEY = '_sentidoweb_credentials';

	/**
	 * Gets user credentials
	 *
	 * @return array
	 */
	public function get_credentials() {
		$credentials = get_user_meta( get_current_user_id(), self::USER_META_KEY, true );
		if ( $credentials ) {
			return (array) json_decode( $credentials );
		}
		return [];
	}

	/**
	 * Gets user credentials list without extendend info
	 *
	 * @return array
	 */
	public function get_credentials_list() {
		$credentials = $this->get_credentials();
		foreach ( $credentials as $id => $credential ) {
			$data               = [];
			$data['type']       = $credential->type;
			$data['credentialID']       = $credential->authData->credentialID;
			$data['id']         = $id;
			$data['rawID']      = $credential->id;
			$data['name']       = isset( $credential->name ) ? $credential->name : __( 'No name', 'sw-2fa' );
			$credentials[ $id ] = $data;
		}
		return $credentials;
	}

	/**
	 * Add credential
	 *
	 * @param string $type Credential type.
	 * @param array  $credential Credential.
	 * @return array
	 */
	public function add_credential( $type, $credential ) {
		$credentials = $this->get_credentials();
		if ( ! $credentials ) {
			$credentials = [];
		}
		$credential->type                   = $type;
		$credentials[ wp_generate_uuid4() ] = $credential;
		return update_user_meta( get_current_user_id(), self::USER_META_KEY, wp_json_encode( $credentials ) );
	}
}
