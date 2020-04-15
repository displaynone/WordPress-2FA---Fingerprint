<?php
/**
 * Deactivator
 *
 * @since 1.0.0
 *
 * @package SentidoWeb\WebAuthn2FA
 */

namespace SentidoWeb\WebAuthn2FA;

// Abort if this file is called directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

/**
 * Class Deactivator.
 *
 * Runs when the plugin is deactivated.
 */
class Deactivator {

	/**
	 * Run Code.
	 *
	 * @since 1.0.0
	 */
	public function run() {
		register_deactivation_hook( SENTIDOWEB_WEBAUTHN_2FA_ROOT, array( $this, 'deactivate' ) );
	}

	/**
	 * Deactivate
	 *
	 * Runs code on deactivation.
	 *
	 * @since 1.0.0
	 */
	public function deactivate() {
		// Set a transient to confirm deactivation.
		set_transient( SENTIDOWEB_WEBAUTHN_2FA_PREFIX . '_activated', false );
	}
}
