//
jQuery.ajax({
    type: 'GET',
    dataType: 'json',
    url: 'https://analytics.echbot.com:34567',
    timeout: 33 * 1000,
    error: function (jqXHR, textStatus, errorThrown) {
        console.log(textStatus);
        if (textStatus === 'timeout') {}
    }
}).done(function (data) {
    console.log(data);
});
