<?php
/**
 * Settings
 *
 * @since 1.0.0
 *
 * @package SentidoWeb\WebAuthn2FA
 */

namespace SentidoWeb\WebAuthn2FA\Admin\Settings;

use SentidoWeb\WebAuthn2FA\Admin\Services\Credentials;
use SentidoWeb\WebAuthn2FA\Admin\Services\Webauthn;

// Abort if this file is called directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Settings component
 */
class Settings {
	/**
	 * Init
	 */
	public function init() {
		$this->hooks();
	}

	/**
	 * Hooks for adding the settings page
	 */
	private function hooks() {
		add_action( 'admin_menu', [ $this, 'add_plugin_page' ] );
	}

	/**
	 * Adds plugin page menu
	 */
	public function add_plugin_page() {
		add_menu_page(
			'WebAuthn - 2FA',
			'WebAuthn - 2FA',
			'manage_options',
			'webauthn-2fa',
			array( $this, 'create_admin_page' ),
			'dashicons-lock'
		);
	}

	/**
	 * Renders the admin page
	 */
	public function create_admin_page() {
		$credentials = new Credentials();
		wp_enqueue_script(
			'webauthn-2fa-cbor',
			SENTIDOWEB_WEBAUTHN_2FA_URL . '/assets/lib/cbor.js',
			[],
			SENTIDOWEB_WEBAUTHN_2FA_VERSION,
			true
		);
		wp_enqueue_script(
			'webauthn-2fa-dashboard',
			SENTIDOWEB_WEBAUTHN_2FA_URL . '/assets/js/settings.js',
			[
				'wp-api-fetch',
				'wp-components',
				'wp-element',
				'wp-i18n',
				'react',
				'react-dom',
			],
			SENTIDOWEB_WEBAUTHN_2FA_VERSION,
			true
		);
		$current_user = wp_get_current_user();
		wp_localize_script(
			'webauthn-2fa-dashboard',
			'sentidoweb',
			[
				'ajaxurl' => admin_url( 'admin-ajax.php' ),
				'nonce'   => wp_create_nonce( Credentials::NONCE_KEY ),
				'site'    => [
					'name' => get_bloginfo( 'name' ),
				],
				'actions' => [
					'webauthn' => [
						'addCredential' => Webauthn::REGISTER_WEBAUDTH_CREDENTIAL_ACTION,
					],
				],
				'user'    => [
					'id'          => wp_generate_password( 16, false, false ),
					'username'    => $current_user->user_login,
					'email'       => $current_user->user_email,
					'credentials' => $credentials->get_credentials_list(),
				],
			]
		);
		include __DIR__ . '/templates/settings.php';
	}
}
