<?php
/**
 * Uninstaller
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
 * Class Uninstaller.
 *
 * Runs when the plugin is uninstalled.
 */
class Uninstaller {

	/**
	 * Run Code.
	 *
	 * @since 1.0.0
	 */
	public function run() {
		register_uninstall_hook( SENTIDOWEB_WEBAUTHN_2FA_ROOT, array( 'SentidoWeb\Blocks\Uninstaller', 'uninstall' ) );
	}

	/**
	 * Uninstall
	 *
	 * Runs code on uninstall.
	 *
	 * @since 1.0.0
	 */
	public static function uninstall() {
		// Remove a transient to confirm uninstallation.
		delete_transient( SENTIDOWEB_WEBAUTHN_2FA_PREFIX . '_activated' );
	}
}
