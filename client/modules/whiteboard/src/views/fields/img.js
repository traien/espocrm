Espo.define('whiteboard:views/fields/img', 'views/fields/file', function (Dep) {

    return Dep.extend({

        type: 'image',

        showPreview: true,

        accept: ['image/*'],

        defaultType: 'image/jpeg',

        previewSize: 'small',

        afterRender: function () {
            Dep.prototype.setup.call(this);
            console.log('after render');
        },
    });
});
