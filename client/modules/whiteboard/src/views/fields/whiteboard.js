Espo.define('whiteboard:views/fields/whiteboard', 'views/fields/image', function (Dep) {

    return Dep.extend({

        setup: function () {
            Dep.prototype.setup.call(this);

            this.guid = this.model.get(this.name + 'Guid');
            if (!this.guid) {
                this.guid = this.generateGuid();
                this.model.set(this.name + 'Guid', this.guid);
            }
        },

        openModal: function () {
            if (this.isReadMode()) return;

            var id = this.model.get(this.idName);
            this.createView('preview', 'whiteboard:views/modals/whiteboard', {
                id: id,
                guid: this.guid,
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

        events: _.extend(Dep.prototype.events, {
            'click .gray-box': function (e) {
                e.preventDefault();
                this.openModal();
            },
            'click input.file': function (e) {
                e.preventDefault();
                this.openModal();
            },
        }),

        uploadFile: function (canvas) {
            var isCanceled = false;

            this.isUploading = true;
            this.getModelFactory().create('Attachment', function (attachment) {
                var $attachmentBox = this.addAttachmentBox('tooth-chart.png', 'image/png');
                var dataURL = canvas;

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
        },

        generateGuid: function () {
            var result, i, j;
            result = '';
            for (j = 0; j < 32; j++) {
                if (j == 8 || j == 12 || j == 16 || j == 20)
                    result = result + '-';
                i = Math.floor(Math.random() * 16).toString(16).toUpperCase();
                result = result + i;
            }
            return result;
        }
    });
});
