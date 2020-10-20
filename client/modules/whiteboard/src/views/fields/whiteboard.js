Espo.define('whiteboard:views/fields/whiteboard', 'views/fields/image', function (Dep) {

    return Dep.extend({

        // type: 'image',
        //
        // showPreview: true,
        //
        // accept: ['image/*'],
        //
        // defaultType: 'image/jpeg',

        detailTemplate: 'whiteboard:fields/whiteboard/detail',

        // previewSize: 'small',

        setup: function () {
            Dep.prototype.setup.call(this);
            console.log('setup');

            this.setReadOnly();

            this.model.on('after:save', function (data) {
                console.log('saved');
                console.log(data);
                this.model
                // if (this.itemListChanged) {
                //
                //     // html2canvas(document.querySelector("#tooth-chart")).then(function (canvas) {
                //     //     this.uploadFile(canvas)
                //     // }.bind(this));
                // }
            }.bind(this));

            // this.model.on('change:itemList', function () {
            //     this.itemListChanged = true;
            // }.bind(this))
        },
        // setMode: function (mode) {
        //     Dep.prototype.setMode.call(this, 'edit');
        // },
        events: {
            'click img[data-action="showWbPreview"]': function (e) {
                e.preventDefault();

                var id = this.model.get(this.idName);
                this.createView('preview', 'whiteboard:views/modals/whiteboard', {
                    id: id,
                    model: this.model,
                    name: this.model.get(this.nameName)
                }, function (view) {
                    view.render();
                    this.listenToOnce(view, 'after:save', function (data) {
                        console.log('saved');
                        console.log(data.canvas);
                        this.uploadFile(data.canvas);
                    }, this);
                });
            },
            'click input.file': function (e) {
                e.preventDefault();

                var id = this.model.get(this.idName);
                this.createView('preview', 'whiteboard:views/modals/whiteboard', {
                    id: id,
                    model: this.model,
                    name: this.model.get(this.nameName)
                }, function (view) {
                    view.render();
                    this.listenToOnce(view, 'after:save', function (data) {
                        console.log('saved');
                        console.log(data.canvas);
                        this.uploadFile(data.canvas);
                    }, this);
                });
            },
        },
        uploadFile: function (canvas) {
            var isCanceled = false;

            this.isUploading = true;
            console.log('uploading');
            this.getModelFactory().create('Attachment', function (attachment) {
                var $attachmentBox = this.addAttachmentBox('tooth-chart.png', 'image/png');
                var dataURL = canvas.toDataURL();

                this.$el.find('.attachment-button').addClass('hidden');

                attachment.set('name', 'tooth-chart.png');
                attachment.set('type', 'image/png');
                attachment.set('size', dataURL.length);
                attachment.set('role', 'Attachment');
                attachment.set('relatedType', this.model.name);
                attachment.set('file', dataURL);
                attachment.set('field', this.name);

                attachment.save({}, {timeout: 0}).then(function () {
                    this.isUploading = false;
                    if (!isCanceled) {
                        $attachmentBox.trigger('ready');
                        this.setAttachment(attachment);
                        this.model.save().then(function (value) {

                        });
                    }
                }.bind(this)).fail(function () {
                    $attachmentBox.remove();
                    this.$el.find('.uploading-message').remove();
                    this.$el.find('.attachment-button').removeClass('hidden');
                    this.isUploading = false;
                }.bind(this));

            }, this);
        }
    });
});
