<?php
/**
 * Admin
 *
 * There are 2 mayor components:
 *   - Add a WebAuthn or 2FA security layer in login
 *   - Plugin settings
 *
 * @since 1.0.0
 *
 * @package SentidoWeb\WebAuthn2FA
 */

namespace SentidoWeb\WebAuthn2FA\Admin;

// Abort if this file is called directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Block scripts
 */
class Main {
	/**
	 * Init
	 *
	 * @since 1.0.0
	 */
	public function init() {
		if ( is_admin() ) {
			( new Settings\Settings() )->init();
			( new Services\WebAuthn() )->init();
		}
	}
}
