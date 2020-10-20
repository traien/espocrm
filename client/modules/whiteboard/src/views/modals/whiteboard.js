Espo.define('whiteboard:views/modals/whiteboard', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'whiteboard-preview',

        template: 'whiteboard:modals/whiteboard',

        size: '',

        header: 'Whiteboard',

        backdrop: true,

        transformClassList: [
            'transform-flip',
            'transform-rotate-180',
            'transform-flip-and-rotate-180',
            'transform-flip-and-rotate-270',
            'transform-rotate-90',
            'transform-flip-and-rotate-90',
            'transform-rotate-270',
        ],
        setup: function () {
            Dep.prototype.setup.call(this);
            this.buttonList = [
                {
                    name: 'cancel',
                    label: 'Cancel'
                },
                {
                    name: 'save',
                    label: 'Save'
                }
            ];
            console.log('setup modal');

            // this.once('save', function () {
            //     console.log('saved');
            //
            //     // if (this.itemListChanged) {
            //     //
            //         html2canvas(document.querySelector("#whiteboard-frame")).then(function (canvas) {
            //             this.uploadFile(canvas)
            //         }.bind(this));
            //     // }
            // }.bind(this));

            // this.model.on('change:itemList', function () {
            //     this.itemListChanged = true;
            // }.bind(this))
        },
        actionSave: function () {
            console.log('saving');
            html2canvas(document.querySelector("#whiteboard-frame")).then(function (canvas) {
                // this.uploadFile(canvas);
                this.trigger('after:save', {canvas : canvas});
                this.close();
            }.bind(this));
        },

    });
});
