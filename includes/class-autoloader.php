<?php
/**
 * Autoloader class
 *
 * @package SentidoWeb/WebAuthn2FA
 */

namespace SentidoWeb\WebAuthn2FA;

defined( 'ABSPATH' ) || exit;

/**
 * Autoloader class
 *
 * @since 1.0.0
 */
class Autoloader {

	/**
	 * The Constructor.
	 *
	 * @since 1.0.0
	 */
	public function __construct() {
		spl_autoload_register( array( $this, 'autoload' ) );
	}

	/**
	 * Autoload classes
	 *
	 * @param string $class Class name.
	 * @since 1.0.0
	 */
	public function autoload( $class ) {
		if ( ! preg_match( '/^SentidoWeb\\\\WebAuthn2FA/', $class ) ) {
			return;
		}
		$path = 'includes';
		$file = SENTIDOWEB_WEBAUTHN_2FA_DIR . strtolower( str_replace( [ 'SentidoWeb\\WebAuthn2FA\\', '/', '\\' ], [ '\\' . $path . '\\', DIRECTORY_SEPARATOR, DIRECTORY_SEPARATOR ], $class ) . '.php' );
		$file = preg_replace( '/([\w]+)\.php/', 'class-$1.php', $file );
		include $file;
	}
}

new Autoloader();
