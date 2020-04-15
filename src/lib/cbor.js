/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Patrick Gansterer <paroga@paroga.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/** @link https://github.com/paroga/cbor-js/blob/master/cbor.js */

/* eslint-disable no-bitwise */
/* eslint-disable no-mixed-operators */

const POW_2_24 = 5.960464477539063e-8,
	POW_2_32 = 4294967296,
	POW_2_53 = 9007199254740992;

function encode( value ) {
	let data = new ArrayBuffer( 256 );
	let dataView = new DataView( data );
	let lastLength;
	let offset = 0;

	function prepareWrite( length ) {
		let newByteLength = data.byteLength;
		const requiredLength = offset + length;
		while ( newByteLength < requiredLength ) {
			newByteLength <<= 1;
		}
		if ( newByteLength !== data.byteLength ) {
			const oldDataView = dataView;
			data = new ArrayBuffer( newByteLength );
			dataView = new DataView( data );
			const uint32count = ( offset + 3 ) >> 2;
			for ( let i = 0; i < uint32count; ++i ) {
				dataView.setUint32( i << 2, oldDataView.getUint32( i << 2 ) );
			}
		}

		lastLength = length;
		return dataView;
	}
	function commitWrite() {
		offset += lastLength;
	}
	function writeFloat64( value64 ) {
		commitWrite( prepareWrite( 8 ).setFloat64( offset, value64 ) );
	}
	function writeUint8( value8 ) {
		commitWrite( prepareWrite( 1 ).setUint8( offset, value8 ) );
	}
	function writeUint8Array( valueArray ) {
		const dataViewArray = prepareWrite( valueArray.length );
		for ( let i = 0; i < valueArray.length; ++i ) {
			dataViewArray.setUint8( offset + i, valueArray[ i ] );
		}
		commitWrite();
	}
	function writeUint16( value16 ) {
		commitWrite( prepareWrite( 2 ).setUint16( offset, value16 ) );
	}
	function writeUint32( value32 ) {
		commitWrite( prepareWrite( 4 ).setUint32( offset, value32 ) );
	}
	function writeUint64( value64 ) {
		const low = value64 % POW_2_32;
		const high = ( value64 - low ) / POW_2_32;
		const dataView64 = prepareWrite( 8 );
		dataView64.setUint32( offset, high );
		dataView64.setUint32( offset + 4, low );
		commitWrite();
	}
	function writeTypeAndLength( type, length ) {
		if ( length < 24 ) {
			writeUint8( type << 5 | length );
		} else if ( length < 0x100 ) {
			writeUint8( type << 5 | 24 );
			writeUint8( length );
		} else if ( length < 0x10000 ) {
			writeUint8( type << 5 | 25 );
			writeUint16( length );
		} else if ( length < 0x100000000 ) {
			writeUint8( type << 5 | 26 );
			writeUint32( length );
		} else {
			writeUint8( type << 5 | 27 );
			writeUint64( length );
		}
	}

	function encodeItem( valueItem ) {
		let i;

		if ( valueItem === false ) {
			return writeUint8( 0xf4 );
		}
		if ( valueItem === true ) {
			return writeUint8( 0xf5 );
		}
		if ( valueItem === null ) {
			return writeUint8( 0xf6 );
		}
		if ( valueItem === undefined ) {
			return writeUint8( 0xf7 );
		}

		switch ( typeof valueItem ) {
			case 'number':
				if ( Math.floor( valueItem ) === valueItem ) {
					if ( 0 <= valueItem && valueItem <= POW_2_53 ) {
						return writeTypeAndLength( 0, valueItem );
					}
					if ( -POW_2_53 <= valueItem && valueItem < 0 ) {
						return writeTypeAndLength( 1, -( valueItem + 1 ) );
					}
				}
				writeUint8( 0xfb );
				return writeFloat64( valueItem );

			case 'string':
				const utf8data = [];
				for ( i = 0; i < valueItem.length; ++i ) {
					let charCode = valueItem.charCodeAt( i );
					if ( charCode < 0x80 ) {
						utf8data.push( charCode );
					} else if ( charCode < 0x800 ) {
						utf8data.push( 0xc0 | charCode >> 6 );
						utf8data.push( 0x80 | charCode & 0x3f );
					} else if ( charCode < 0xd800 ) {
						utf8data.push( 0xe0 | charCode >> 12 );
						utf8data.push( 0x80 | ( charCode >> 6 ) & 0x3f );
						utf8data.push( 0x80 | charCode & 0x3f );
					} else {
						charCode = ( charCode & 0x3ff ) << 10;
						charCode |= valueItem.charCodeAt( ++i ) & 0x3ff;
						charCode += 0x10000;

						utf8data.push( 0xf0 | charCode >> 18 );
						utf8data.push( 0x80 | ( charCode >> 12 ) & 0x3f );
						utf8data.push( 0x80 | ( charCode >> 6 ) & 0x3f );
						utf8data.push( 0x80 | charCode & 0x3f );
					}
				}

				writeTypeAndLength( 3, utf8data.length );
				return writeUint8Array( utf8data );

			default:
				let length;
				if ( Array.isArray( valueItem ) ) {
					length = valueItem.length;
					writeTypeAndLength( 4, length );
					for ( i = 0; i < length; ++i ) {
						encodeItem( valueItem[ i ] );
					}
				} else if ( valueItem instanceof Uint8Array ) {
					writeTypeAndLength( 2, valueItem.length );
					writeUint8Array( valueItem );
				} else {
					const keys = Object.keys( valueItem );
					length = keys.length;
					writeTypeAndLength( 5, length );
					for ( i = 0; i < length; ++i ) {
						const key = keys[ i ];
						encodeItem( key );
						encodeItem( valueItem[ key ] );
					}
				}
		}
	}

	encodeItem( value );

	if ( 'slice' in data ) {
		return data.slice( 0, offset );
	}

	const ret = new ArrayBuffer( offset );
	const retView = new DataView( ret );
	for ( let i = 0; i < offset; ++i ) {
		retView.setUint8( i, dataView.getUint8( i ) );
	}
	return ret;
}

function decode( data, tagger, simpleValue ) {
	const dataView = new DataView( data );
	let offset = 0;

	if ( typeof tagger !== 'function' ) {
		tagger = function( value ) {
			return value;
		};
	}
	if ( typeof simpleValue !== 'function' ) {
		simpleValue = function() {
			return undefined;
		};
	}

	function commitRead( length, value ) {
		offset += length;
		return value;
	}
	function readArrayBuffer( length ) {
		return commitRead( length, new Uint8Array( data, offset, length ) );
	}
	function readFloat16() {
		const tempArrayBuffer = new ArrayBuffer( 4 );
		const tempDataView = new DataView( tempArrayBuffer );
		const value = readUint16();

		const sign = value & 0x8000;
		let exponent = value & 0x7c00;
		const fraction = value & 0x03ff;

		if ( exponent === 0x7c00 ) {
			exponent = 0xff << 10;
		} else if ( exponent !== 0 ) {
			exponent += ( 127 - 15 ) << 10;
		} else if ( fraction !== 0 ) {
			return ( sign ? -1 : 1 ) * fraction * POW_2_24;
		}

		tempDataView.setUint32( 0, sign << 16 | exponent << 13 | fraction << 13 );
		return tempDataView.getFloat32( 0 );
	}
	function readFloat32() {
		return commitRead( 4, dataView.getFloat32( offset ) );
	}
	function readFloat64() {
		return commitRead( 8, dataView.getFloat64( offset ) );
	}
	function readUint8() {
		return commitRead( 1, dataView.getUint8( offset ) );
	}
	function readUint16() {
		return commitRead( 2, dataView.getUint16( offset ) );
	}
	function readUint32() {
		return commitRead( 4, dataView.getUint32( offset ) );
	}
	function readUint64() {
		return readUint32() * POW_2_32 + readUint32();
	}
	function readBreak() {
		if ( dataView.getUint8( offset ) !== 0xff ) {
			return false;
		}
		offset += 1;
		return true;
	}
	function readLength( additionalInformation ) {
		if ( additionalInformation < 24 ) {
			return additionalInformation;
		}
		if ( additionalInformation === 24 ) {
			return readUint8();
		}
		if ( additionalInformation === 25 ) {
			return readUint16();
		}
		if ( additionalInformation === 26 ) {
			return readUint32();
		}
		if ( additionalInformation === 27 ) {
			return readUint64();
		}
		if ( additionalInformation === 31 ) {
			return -1;
		}
		throw 'Invalid length encoding';
	}
	function readIndefiniteStringLength( majorType ) {
		const initialByte = readUint8();
		if ( initialByte === 0xff ) {
			return -1;
		}
		const length = readLength( initialByte & 0x1f );
		if ( length < 0 || ( initialByte >> 5 ) !== majorType ) {
			throw 'Invalid indefinite length element';
		}
		return length;
	}

	function appendUtf16Data( utf16data, length ) {
		for ( let i = 0; i < length; ++i ) {
			let value = readUint8();
			if ( value & 0x80 ) {
				if ( value < 0xe0 ) {
					value = ( value & 0x1f ) << 6 |
						( readUint8() & 0x3f );
					length -= 1;
				} else if ( value < 0xf0 ) {
					value = ( value & 0x0f ) << 12 |
						( readUint8() & 0x3f ) << 6 |
						( readUint8() & 0x3f );
					length -= 2;
				} else {
					value = ( value & 0x0f ) << 18 |
						( readUint8() & 0x3f ) << 12 |
						( readUint8() & 0x3f ) << 6 |
						( readUint8() & 0x3f );
					length -= 3;
				}
			}

			if ( value < 0x10000 ) {
				utf16data.push( value );
			} else {
				value -= 0x10000;
				utf16data.push( 0xd800 | ( value >> 10 ) );
				utf16data.push( 0xdc00 | ( value & 0x3ff ) );
			}
		}
	}

	function decodeItem() {
		const initialByte = readUint8();
		const majorType = initialByte >> 5;
		const additionalInformation = initialByte & 0x1f;
		let i;
		let length;

		if ( majorType === 7 ) {
			switch ( additionalInformation ) {
				case 25:
					return readFloat16();
				case 26:
					return readFloat32();
				case 27:
					return readFloat64();
			}
		}

		length = readLength( additionalInformation );
		if ( length < 0 && ( majorType < 2 || 6 < majorType ) ) {
			throw 'Invalid length';
		}

		switch ( majorType ) {
			case 0:
				return length;
			case 1:
				return -1 - length;
			case 2:
				if ( length < 0 ) {
					const elements = [];
					let fullArrayLength = 0;
					while ( ( length = readIndefiniteStringLength( majorType ) ) >= 0 ) {
						fullArrayLength += length;
						elements.push( readArrayBuffer( length ) );
					}
					const fullArray = new Uint8Array( fullArrayLength );
					let fullArrayOffset = 0;
					for ( i = 0; i < elements.length; ++i ) {
						fullArray.set( elements[ i ], fullArrayOffset );
						fullArrayOffset += elements[ i ].length;
					}
					return fullArray;
				}
				return readArrayBuffer( length );
			case 3:
				const utf16data = [];
				if ( length < 0 ) {
					while ( ( length = readIndefiniteStringLength( majorType ) ) >= 0 ) {
						appendUtf16Data( utf16data, length );
					}
				} else {
					appendUtf16Data( utf16data, length );
				}
				return String.fromCharCode.apply( null, utf16data );
			case 4:
				let retArray;
				if ( length < 0 ) {
					retArray = [];
					while ( ! readBreak() ) {
						retArray.push( decodeItem() );
					}
				} else {
					retArray = new Array( length );
					for ( i = 0; i < length; ++i ) {
						retArray[ i ] = decodeItem();
					}
				}
				return retArray;
			case 5:
				const retObject = {};
				for ( i = 0; i < length || length < 0 && ! readBreak(); ++i ) {
					const key = decodeItem();
					retObject[ key ] = decodeItem();
				}
				return retObject;
			case 6:
				return tagger( decodeItem(), length );
			case 7:
				switch ( length ) {
					case 20:
						return false;
					case 21:
						return true;
					case 22:
						return null;
					case 23:
						return undefined;
					default:
						return simpleValue( length );
				}
		}
	}

	const ret = decodeItem();
	if ( offset !== data.byteLength ) {
		throw 'Remaining bytes';
	}
	return ret;
}

export default { encode: encode, decode: decode };

