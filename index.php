<?php //@codingStandardsIgnoreLine
/**
 * WebAuthn (Fingerprints) and 2FA
 *
 * @package SentidoWeb/WebAuthn2FA
 *
 * Plugin Name: WebAuthn and 2FA
 * Plugin URI: https://github.com/displaynone/wordpress-2fa-webauthn
 * Description: Allows add extra security layer to WordPress using 2FA and WebAuthn (Fingerprints)
 * Author: Luis Sacristán
 * Author URI: https://sentidoweb.com/
 * Version: 1.0.0
 * License: GPL2+
 * License URI: https://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: sw-2fa
 * Domain Path: /languages
 */

/**
 * Copyright (C) 2019  Luis Sacristán
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License, version 3, as
 * published by the Free Software Foundation.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

namespace SentidoWeb\WebAuthn2FA;

// Abort if this file is called directly.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Constants.
define( 'SENTIDOWEB_WEBAUTHN_2FA_ROOT', __FILE__ );
define( 'SENTIDOWEB_WEBAUTHN_2FA_DIR', __DIR__ );
define( 'SENTIDOWEB_WEBAUTHN_2FA_URL', plugin_dir_url( __FILE__ ) );
define( 'SENTIDOWEB_WEBAUTHN_2FA_PREFIX', 'webpathn_2fa' );

require __DIR__ . '/includes/class-autoloader.php';

use SentidoWeb\WebAuthn2FA\Admin\Main as MainAdmin;

/**
 * The main loader for this plugin
 */
class Main {

	/**
	 * Run all of the plugin functions.
	 *
	 * @since 1.0.0
	 */
	public function run() {
		define( 'SENTIDOWEB_WEBAUTHN_2FA_VERSION', $this->get_plugin_version() );

		/**
		 * Load Text Domain
		 */
		load_plugin_textdomain( 'sw_2fa', false, SENTIDOWEB_WEBAUTHN_2FA_ROOT . '\languages' );

		/**
		 * Load Classes
		 *
		 * Load all the other classes that this plugin needs to run.
		 */
		$this->includes();
	}

	/**
	 * Include Classes
	 */
	public function includes() {

		// Instantiate Classes.
		$activator   = new Activator();
		$deactivator = new Deactivator();
		$uninstaller = new Uninstaller();

		// Run Code.
		$activator->run();   // Run code on activation.
		$deactivator->run(); // Run code on deactivation.
		$uninstaller->run(); // Run code on uninstallation.

		( new MainAdmin() )->init();
	}

	/**
	 * Gets the plugin version
	 *
	 * @return {string}
	 */
	private function get_plugin_version() {
		if ( ! function_exists( 'get_plugin_data' ) ) {
			require_once ABSPATH . 'wp-admin/includes/plugin.php';
		}
		$plugin_data = \get_plugin_data( __FILE__ );
		return $plugin_data['Version'];
	}
}

$sw_2fa = new Main();
$sw_2fa->run();
