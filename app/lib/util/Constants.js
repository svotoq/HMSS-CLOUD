sap.ui.define([], function () {
	"use strict";
    return Object.freeze({
        ODATA_DONT_SUBMIT_GROUPID: "dontSubmit",
        VIEW_MODES: {
            CREATE: "I",
            EDIT: "U",
            DISPLAY: "D"
        },
        ODATA_ACTIONS: {
            CREATE: "CREATE",
            UPDATE: "UPDATE",
            DELETE: "DELETE"
        },
        BO_ACTION: {
        	ADD_ITEM: "ADD_ITEM",
			CREATE_ORDER: "CREATE_ORDER",
			VIEW_CART: "CART_ROUNDTRIP",
			FULFILLMENT: "FULFILLMENT",
			SAVE: "SAVE",
			EDIT: "EDIT",
			TAB_CHANGE: "TAB_CHANGE"
        },
		PRODUCT_TYPES: {
			TIRE: "ZTIR",
			WHEEL: "ZWHL",
			ACCESSORY: "ZACC"
		},
		PRODUCT_CATEGORIES: {
			ECC_TIRE: "ZTIR_ECC",
			FITMENT_TIRE: "ZTIR_FITMENT",
			BOTH_TIRE: "ZTIR_B",
			STAGGERED_TIRE: "ZTIR_S",
			ECC_WHEEL: "ZWHL_ECC",
			FITMENT_WHEEL: "ZWHL_FITMENT",
			BOTH_WHEEL: "ZWHL_B",
			STAGGERED_WHEEL: "ZWHL_S",
			ECC_ACCESSORY: "ZACC_ECC",
			FITMENT_ACCESSORY: "ZACC_FITMENT"
		},
		PRICE_TYPES: {
        	RETAIL: "RETAIL",
			WHOLESALE: "WHOLESALE"
		},
		CUSTOMER_ADDRESS_TYPES: {
        	PRIMARY: "PRIMARY",
			ALTERNATIVE: "ALTERNATIVE",
			ADDITIONAL: "OTHER"
		},
		CUSTOMER_TYPES: {
			REGISTERED: "REGISTERED",
			GUEST: "GUEST",
			RETAIL: "RETAIL",
			RESALE: "RESALE"
		},
		PHONE_TYPES: {
			WORK: "WORK",
			HOME: "HOME",
			MOBILE: "MOBILE"
		},
		ADDRESS_VERIFICATION_STATUS: {
			VERIFIED: "0",
			INTERACTION: "1",
			PICKLIST: "2"
		},
		PARTNER_FUNCTION: {
			SHIP_TO: "SH"
		},

        // Constants for all HTTP codes
		HTTP_CODES: {
			CONTINUE: 100,
			SWITCHING_PROTOCOLS: 101,
			PROCESSING: 102,
			OK: 200,
			CREATED: 201,
			ACCEPTED: 202,
			NON_AUTHORITATIVE_INFORMATION: 203,
			NO_CONTENT: 204,
			RESET_CONTENT: 205,
			PARTIAL_CONTENT: 206,
			MULTI_STATUS: 207,
			MULTIPLE_CHOICES: 300,
			MOVED_PERMANENTLY: 301,
			MOVED_TEMPORARILY: 302,
			SEE_OTHER: 303,
			NOT_MODIFIED: 304,
			USE_PROXY: 305,
			TEMPORARY_REDIRECT: 307,
			PERMANENT_REDIRECT: 308,
			BAD_REQUEST: 400,
			UNAUTHORIZED: 401,
			PAYMENT_REQUIRED: 402,
			FORBIDDEN: 403,
			NOT_FOUND: 404,
			METHOD_NOT_ALLOWED: 405,
			NOT_ACCEPTABLE: 406,
			PROXY_AUTHENTICATION_REQUIRED: 407,
			REQUEST_TIMEOUT: 408,
			CONFLICT: 409,
			GONE: 410,
			LENGTH_REQUIRED: 411,
			PRECONDITION_FAILED: 412,
			REQUEST_TOO_LONG: 413,
			REQUEST_URI_TOO_LONG: 414,
			UNSUPPORTED_MEDIA_TYPE: 415,
			REQUESTED_RANGE_NOT_SATISFIABLE: 416,
			EXPECTATION_FAILED: 417,
			IM_A_TEAPOT: 418,
			INSUFFICIENT_SPACE_ON_RESOURCE: 419,
			METHOD_FAILURE: 420,
			UNPROCESSABLE_ENTITY: 422,
			LOCKED: 423,
			FAILED_DEPENDENCY: 424,
			PRECONDITION_REQUIRED: 428,
			TOO_MANY_REQUESTS: 429,
			REQUEST_HEADER_FIELDS_TOO_LARGE: 431,
			INTERNAL_SERVER_ERROR: 500,
			NOT_IMPLEMENTED: 501,
			BAD_GATEWAY: 502,
			SERVICE_UNAVAILABLE: 503,
			GATEWAY_TIMEOUT: 504,
			HTTP_VERSION_NOT_SUPPORTED: 505,
			INSUFFICIENT_STORAGE: 507,
			NETWORK_AUTHENTICATION_REQUIRED: 511
        },
        ETAG: "etag",
        ODATA_EXCEPTION_MSG_CODE: "/IWBEP/CX_MGW_BUSI_EXCEPTION"
       
    });
});
