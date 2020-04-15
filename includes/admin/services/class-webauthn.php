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
 * WebAuthn Service
 */
class Webauthn extends Credentials {
	const CREDENTIAL_TYPE                     = 'webauthn';
	const REGISTER_WEBAUDTH_CREDENTIAL_ACTION = 'register_webauthn_credential';

	/**
	 * Init
	 */
	public function init() {
		$this->hooks();
	}

	/**
	 * Hooks for webauthn service
	 */
	private function hooks() {
		add_action( 'wp_ajax_register_webauthn_credential', [ $this, 'register_webauthn_credential' ] );
	}

	/**
	 * Stores a WebAuthn credential
	 */
	public function register_webauthn_credential() {
		if ( isset( $_POST['nonce'] ) && isset( $_POST['credential'] ) ) {
			$nonce = sanitize_text_field( wp_unslash( $_POST['nonce'] ) );
			if ( ! wp_verify_nonce( $nonce, self::REGISTER_WEBAUDTH_CREDENTIAL_ACTION ) ) {
				wp_die();
			}
			$credential = json_decode( sanitize_text_field( wp_unslash( $_POST['credential'] ) ) );
			if ( $credential ) {
				$this->add_credential( self::CREDENTIAL_TYPE, $credential );
			}
		}
		wp_die();
	}
}
