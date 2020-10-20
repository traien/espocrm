Espo.define('whiteboard:views/modals/whiteboard', ['views/modal'], function (Dep) {

    return Dep.extend({

        cssName: 'whiteboard-preview',

        template: 'whiteboard:modals/whiteboard',

        header: 'Whiteboard',

        backdrop: true,

        setup: function () {
            Dep.prototype.setup.call(this);

            this.whiteboardUrl = this.getConfig().get('whiteboardUrl');
            this.buttonList = [
                {
                    name: 'cancel',
                    label: 'Cancel'
                },
                {
                    name: 'save',
                    style: 'primary',
                    label: 'Save'
                }
            ];
        },

        data: function () {
            var data = {};
            data.guid = this.options.guid;
            data.whiteboardUrl = this.whiteboardUrl;
            return data;
        },

        actionSave: function () {
            var myFrame = document.getElementById('whiteboard-frame');
            myFrame.contentWindow.postMessage(location.origin, this.whiteboardUrl);

            window.addEventListener('message', function (event) {
                // IMPORTANT: check the origin of the data!
                if (event.origin.startsWith(this.whiteboardUrl)) {
                    // The data was sent from your site.
                    // Data sent with postMessage is stored in event.data:
                    this.trigger('after:save', {canvas: event.data});
                    this.close();
                } else {
                    // The data was NOT sent from your site!
                    // Be careful! Do not use it. This else branch is
                    // here just for clarity, you usually shouldn't need it.
                }
            }.bind(this));
        },
    });
});
