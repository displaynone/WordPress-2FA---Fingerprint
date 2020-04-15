import Main from './settings/components/main';
import React from 'react';
import ReactDOM from 'react-dom';

/**
 * Class that handles WebAuthn registering
 */
class Settings {
	init() {
		ReactDOM.render( <Main />, document.getElementById( 'sw-2fa-settings' ) );
	}
}

document.addEventListener( 'DOMContentLoaded', () => {
	( new Settings() ).init();
} );
