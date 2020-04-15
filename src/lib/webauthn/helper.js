/**
 * WebAuthn helper
 *
 * @link https://github.com/josemore/passwordless/blob/1c7344dd5dfbf9c942e7d7776055307b1b7a74fe/client/src/lib/helpers.js
 */
import base64url from 'base64url';
const { crypto, TextDecoder } = window;

export function bufferToString( buff ) {
	const enc = new TextDecoder(); // always utf-8
	return enc.decode( buff );
}

const getEndian = () => {
	const arrayBuffer = new ArrayBuffer( 2 );
	const uint8Array = new Uint8Array( arrayBuffer );
	const uint16array = new Uint16Array( arrayBuffer );
	uint8Array[ 0 ] = 0xAA; // set first byte
	uint8Array[ 1 ] = 0xBB; // set second byte

	if ( uint16array[ 0 ] === 0xBBAA ) {
		return 'little';
	}
	return 'big';
};

const readBE16 = ( buffer ) => {
	if ( buffer.length !== 2 ) {
		throw new Error( 'Only 2byte buffer allowed!' );
	}

	if ( getEndian() !== 'big' ) {
		buffer = buffer.reverse();
	}

	return new Uint16Array( buffer.buffer )[ 0 ];
};

const readBE32 = ( buffer ) => {
	if ( buffer.length !== 4 ) {
		throw new Error( 'Only 4byte buffers allowed!' );
	}

	if ( getEndian() !== 'big' ) {
		buffer = buffer.reverse();
	}

	return new Uint32Array( buffer.buffer )[ 0 ];
};

export function bufToHex( buffer ) { // buffer is an ArrayBuffer
	return Array.prototype.map.call( new Uint8Array( buffer ), x => ( '00' + x.toString( 16 ) ).slice( -2 ) ).join( '' );
}

// https://gist.github.com/herrjemand/dbeb2c2b76362052e5268224660b6fbc
export function parseAuthData( buffer ) {
	const rpIdHash = buffer.slice( 0, 32 ); buffer = buffer.slice( 32 );
	const flagsBuf = buffer.slice( 0, 1 ); buffer = buffer.slice( 1 );
	const flagsInt = flagsBuf[ 0 ];
	const flags = {
		up: !! ( flagsInt & 0x01 ), // eslint-disable-line
		uv: !! ( flagsInt & 0x04 ), // eslint-disable-line
		at: !! ( flagsInt & 0x40 ), // eslint-disable-line
		ed: !! ( flagsInt & 0x80 ), // eslint-disable-line
		flagsInt,
	};

	const counterBuf = buffer.slice( 0, 4 ); buffer = buffer.slice( 4 );
	const counter = readBE32( counterBuf );

	let aaguid;
	let credID;
	let COSEPublicKey;

	if ( flags.at ) {
		aaguid = buffer.slice( 0, 16 ); buffer = buffer.slice( 16 );
		const credIDLenBuf = buffer.slice( 0, 2 ); buffer = buffer.slice( 2 );
		const credIDLen = readBE16( credIDLenBuf );
		credID = buffer.slice( 0, credIDLen ); buffer = buffer.slice( credIDLen );
		COSEPublicKey = buffer;
	}

	return { rpIdHash, flagsBuf, flags, counter, counterBuf, aaguid, credID, COSEPublicKey };
}

export function generateRandomBuffer( length ) {
	if ( ! length ) {
		length = 32;
	}

	const randomBuff = new Uint8Array( length );
	crypto.getRandomValues( randomBuff );
	return randomBuff;
}

export function publicKeyCredentialToJSON( pubKeyCred ) {
	if ( pubKeyCred instanceof Array ) {
		const arr = [];
		for ( const i of pubKeyCred ) {
			arr.push( publicKeyCredentialToJSON( i ) );
		}

		return arr;
	}

	if ( pubKeyCred instanceof ArrayBuffer ) {
		return base64url.encode( pubKeyCred );
	}

	if ( pubKeyCred instanceof Object ) {
		const obj = {};

		for ( const key in pubKeyCred ) {
			obj[ key ] = publicKeyCredentialToJSON( pubKeyCred[ key ] );
		}

		return obj;
	}

	return pubKeyCred;
}

export function preformatMakeCredReq( makeCredReq ) {
	makeCredReq.challenge = base64url.decode( makeCredReq.challenge );
	makeCredReq.user.id = base64url.decode( makeCredReq.user.id );

	return makeCredReq;
}

export function preformatGetAssertReq( getAssert ) {
	getAssert.challenge = base64url.decode( getAssert.challenge );

	for ( const allowCred of getAssert.allowCredentials ) {
		allowCred.id = base64url.decode( allowCred.id );
	}

	return getAssert;
}
