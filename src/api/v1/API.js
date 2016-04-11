/**
 *
 * @type {{GET: {_200: exports.API.GET._200, _204: exports.API.GET._204, _301: exports.API.GET._301, _400: exports.API.GET._400, _401: exports.API.GET._401, _403: exports.API.GET._403, _404: exports.API.GET._404, _405: exports.API.GET._405, _500: exports.API.GET._500, _503: exports.API.GET._503}, POST: {_200: exports.API.POST._200, _201: exports.API.POST._201, _202: exports.API.POST._202, _301: exports.API.POST._301, _400: exports.API.POST._400, _401: exports.API.POST._401, _403: exports.API.POST._403, _404: exports.API.POST._404, _405: exports.API.POST._405, _415: exports.API.POST._415, _500: exports.API.POST._500, _503: exports.API.POST._503}, DELETE: {_200: exports.API.DELETE._200, _204: exports.API.DELETE._204, _301: exports.API.DELETE._301, _400: exports.API.DELETE._400, _401: exports.API.DELETE._401, _403: exports.API.DELETE._403, _404: exports.API.DELETE._404, _405: exports.API.DELETE._405, _500: exports.API.DELETE._500, _503: exports.API.DELETE._503}, PUT: {_200: exports.API.PUT._200, _201: exports.API.PUT._201, _202: exports.API.PUT._202, _301: exports.API.PUT._301, _400: exports.API.PUT._400, _401: exports.API.PUT._401, _403: exports.API.PUT._403, _404: exports.API.PUT._404, _405: exports.API.PUT._405, _415: exports.API.PUT._415, _500: exports.API.PUT._500, _503: exports.API.PUT._503}}}
 */
exports.API = {
    GET: {
        _200: function (_data, _title, _message) {
            return {
                code: 200,
                title: _title || "Veri çekme işlemi",
                message: _message || "xxx veri çekilmesi başarıyla tamamlandı",
                data: _data
            }
        },
        _204: function (_data, _title, _message) {
            return {
                code: 204,
                title: _title || "Veri çekme işlemi",
                message: _message || "İçerik bulunamadı!",
                data: _data
            }
        },
        _301: function (_data, _title, _message) {
            return {
                code: 301,
                title: _title || "Veri çekme işlemi",
                message: _message || "Adres bulunamadı!",
                data: _data
            }
        },
        _400: function (_data, _title, _message) {
            return {
                code: 400,
                title: _title || "Veri çekme işlemi",
                message: _message || "Geçersiz istek!",
                data: _data
            }
        },
        _401: function (_data, _title, _message) {
            return {
                code: 401,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _403: function (_data, _title, _message) {
            return {
                code: 403,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _404: function (_data, _title, _message) {
            return {
                code: 404,
                title: _title || "Veri çekme işlemi",
                message: _message || "Kaynak bulunamadı!",
                data: _data
            }
        },
        _405: function (_data, _title, _message) {
            return {
                code: 405,
                title: _title || "Veri çekme işlemi",
                message: _message || "İzinsiz yöntem! Bu işlemi yapmaya izniniz bulunmamaktadır!",
                data: _data
            }
        },
        _500: function (_data, _title, _message) {
            return {
                code: 500,
                title: _title || "Veri çekme işlemi",
                message: _message || "Sunucu hatası!",
                data: _data
            }
        },
        _503: function (_data, _title, _message) {
            return {
                code: 503,
                title: _title || "Veri çekme işlemi",
                message: _message || "Sunucu isteğe cevap veremiyor!",
                data: _data
            }
        }
    },
    POST: {
        _200: function (_data, _title, _message) {
            return {
                code: 200,
                title: _title || "Veri ekleme işlemi",
                message: _message || "xxx veri ekleme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _201: function (_data, _title, _message) {
            return {
                code: 201,
                title: _title || "Veri ekleme işlemi",
                message: _message || "xxx veri ekleme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _202: function (_data, _title, _message) {
            return {
                code: 202,
                title: _title || "Veri ekleme işlemi",
                message: _message || "xxx veri ekleme işlemi tamamlanamadı!",
                data: _data
            }
        },
        _301: function (_data, _title, _message) {
            return {
                code: 301,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Adres bulunamadı!",
                data: _data
            }
        },
        _400: function (_data, _title, _message) {
            return {
                code: 400,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Geçersiz istek!",
                data: _data
            }
        },
        _401: function (_data, _title, _message) {
            return {
                code: 401,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _403: function (_data, _title, _message) {
            return {
                code: 403,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _404: function (_data, _title, _message) {
            return {
                code: 404,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Kaynak bulunamadı!",
                data: _data
            }
        },
        _405: function (_data, _title, _message) {
            return {
                code: 405,
                title: _title || "Veri ekleme işlemi",
                message: _message || "İzinsiz yöntem! Bu işlemi yapmaya izniniz bulunmamaktadır!",
                data: _data
            }
        },
        _415: function (_data, _title, _message) {
            return {
                code: 415,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Desteklenmeyen tür mevcut!",
                data: _data
            }
        },
        _500: function (_data, _title, _message) {
            return {
                code: 500,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Sunucu hatası!",
                data: _data
            }
        },
        _503: function (_data, _title, _message) {
            return {
                code: 503,
                title: _title || "Veri ekleme işlemi",
                message: _message || "Sunucu isteğe cevap veremiyor!",
                data: _data
            }
        }
    },
    DELETE: {
        _200: function (_data, _title, _message) {
            return {
                code: 200,
                title: _title || "Veri silme işlemi",
                message: _message || "xxx veri silme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _204: function (_data, _title, _message) {
            return {
                code: 204,
                title: _title || "Veri silme işlemi",
                message: _message || "xxx veri silme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _301: function (_data, _title, _message) {
            return {
                code: 301,
                title: _title || "Veri silme işlemi",
                message: _message || "Adres bulunamadı!",
                data: _data
            }
        },
        _400: function (_data, _title, _message) {
            return {
                code: 400,
                title: _title || "Veri silme işlemi",
                message: _message || "Geçersiz istek!",
                data: _data
            }
        },
        _401: function (_data, _title, _message) {
            return {
                code: 401,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _403: function (_data, _title, _message) {
            return {
                code: 403,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _404: function (_data, _title, _message) {
            return {
                code: 404,
                title: _title || "Veri silme işlemi",
                message: _message || "Kaynak bulunamadı!",
                data: _data
            }
        },
        _405: function (_data, _title, _message) {
            return {
                code: 405,
                title: _title || "Veri silme işlemi",
                message: _message || "İzinsiz yöntem! Bu işlemi yapmaya izniniz bulunmamaktadır!",
                data: _data
            }
        },
        _500: function (_data, _title, _message) {
            return {
                code: 500,
                title: _title || "Veri silme işlemi",
                message: _message || "Sunucu hatası!",
                data: _data
            }
        },
        _503: function (_data, _title, _message) {
            return {
                code: 503,
                title: _title || "Veri silme işlemi",
                message: _message || "Sunucu isteğe cevap veremiyor!",
                data: _data
            }
        }
    },
    PUT: {
        _200: function (_data, _title, _message) {
            return {
                code: 200,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "xxx veri güncelleme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _201: function (_data, _title, _message) {
            return {
                code: 201,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "xxx veri güncelleme işlemi başarıyla tamamlandı",
                data: _data
            }
        },
        _202: function (_data, _title, _message) {
            return {
                code: 202,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "xxx veri güncelleme işlemi tamamlanamadı!",
                data: _data
            }
        },
        _301: function (_data, _title, _message) {
            return {
                code: 301,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Adres bulunamadı!",
                data: _data
            }
        },
        _400: function (_data, _title, _message) {
            return {
                code: 400,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Geçersiz istek!",
                data: _data
            }
        },
        _401: function (_data, _title, _message) {
            return {
                code: 401,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _403: function (_data, _title, _message) {
            return {
                code: 403,
                title: _title || "Yetkisiz Erişim",
                message: _message || "Kullanıcı yetkisi bu işlemi yapmaya yetersiz!",
                data: _data
            }
        },
        _404: function (_data, _title, _message) {
            return {
                code: 404,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Kaynak bulunamadı!",
                data: _data
            }
        },
        _405: function (_data, _title, _message) {
            return {
                code: 405,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "İzinsiz yöntem! Bu işlemi yapmaya izniniz bulunmamaktadır!",
                data: _data
            }
        },
        _415: function (_data, _title, _message) {
            return {
                code: 415,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Desteklenmeyen tür mevcut!",
                data: _data
            }
        },
        _500: function (_data, _title, _message) {
            return {
                code: 500,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Sunucu hatası!",
                data: _data
            }
        },
        _503: function (_data, _title, _message) {
            return {
                code: 503,
                title: _title || "Veri güncelleme işlemi",
                message: _message || "Sunucu isteğe cevap veremiyor!",
                data: _data
            }
        }
    }
};