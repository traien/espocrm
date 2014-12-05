/************************************************************************
 * This file is part of EspoCRM.
 *
 * EspoCRM - Open Source CRM application.
 * Copyright (C) 2014  Yuri Kuznetsov, Taras Machyshyn, Oleksiy Avramenko
 * Website: http://www.espocrm.com
 *
 * EspoCRM is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * EspoCRM is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with EspoCRM. If not, see http://www.gnu.org/licenses/.
 ************************************************************************/

Espo.define('Views.Notifications.Badge', 'View', function (Dep) {

    return Dep.extend({

        template: 'notifications.badge',
        
        updateFrequency: 10,
        
        timeout: null,

        popupNotificationsData: null,
        
        events: {
            'click a[data-action="showNotifications"]': function (e) {
                this.showNotifications();
            },
        },
        
        setup: function () {
            this.once('remove', function () {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                for (var name in this.popoupTimeouts) {
                    clearTimeout(this.popoupTimeouts[name]);
                }
            }, this);

            this.lastId = 0;
            this.shownNotificationIds = [];
            this.closedNotificationIds = [];
            this.popoupTimeouts = {};

            delete localStorage['closePopupNotificationId'];

            window.addEventListener('storage', function (e) {
                if (e.key == 'closePopupNotificationId') {
                    var id = localStorage.getItem('closePopupNotificationId');
                    if (id) {
                        var key = 'popup-' + id;
                        if (this.hasView(key)) {
                            this.markPopupRemoved(id);
                            this.clearView(key);
                        }
                    }
                    
                }
            }.bind(this), false);
        },
        
        afterRender: function () {
            this.$badge = this.$el.find('.notifications-button');
            this.$icon = this.$el.find('.notifications-button .icon');

            this.checkUpdates();

            this.$popupContainer = $('#popup-notifications-container');
            if (!$(this.$popupContainer).size()) {
                this.$popupContainer = $('<div>').attr('id', 'popup-notifications-container').addClass('hidden').appendTo('body');
            }

            var popupNotificationsData = this.popupNotificationsData = this.getMetadata().get('app.popupNotifications') || {};
            for (var name in popupNotificationsData) {
                this.checkPopupNotifications(name);
            }
        },
        
        showNotRead: function (count) {
            this.$icon.addClass('warning');
            this.$badge.attr('title', this.translate('New notifications') + ': ' + count);
        },
        
        hideNotRead: function () {
            this.$icon.removeClass('warning');
            this.$badge.attr('title', '');
        },
        
        checkUpdates: function () {
            $.ajax('Notification/action/notReadCount').done(function (count) {
                if (count) {
                    this.showNotRead(count);
                } else {
                    this.hideNotRead();
                }
            }.bind(this));
        
            this.timeout = setTimeout(function () {
                this.checkUpdates();
            }.bind(this), this.updateFrequency * 1000);
        },

        checkPopupNotifications: function (name) {
            var data = this.popupNotificationsData[name] || {};
            var url = data.url;
            var interval = data.interval;

            if (!url || !interval) return;

            $.ajax(url).done(function (list) {
                list.forEach(function (d) {
                    this.showPopupNotification(name, d);
                }, this);
            }.bind(this));
        
            this.popoupTimeouts[name] = setTimeout(function () {
                this.checkPopupNotifications(name);
            }.bind(this), interval * 1000);
        },

        showPopupNotification: function (name, data) {
            var view = this.popupNotificationsData[name].view;
            if (!view) return;

            var id = data.notificationId || null;

            if (id) {
                id = name + '_' + id;
                if (~this.shownNotificationIds.indexOf(id)) return;
                if (~this.closedNotificationIds.indexOf(id)) return;
            } else {
                id = this.lastId++;
            }

            this.shownNotificationIds.push(id);

            this.createView('popup-' + id, view, {
                notificationData: data,
                id: id
            }, function (view) {
                view.render();
                this.$popupContainer.removeClass('hidden');
                this.listenTo(view, 'remove', function () {
                    this.markPopupRemoved(id);
                    localStorage.setItem('closePopupNotificationId', id);
                }, this);
            }.bind(this));
        },

        markPopupRemoved: function (id) {
            var index = this.shownNotificationIds.indexOf(id);
            if (index > -1) {
                this.shownNotificationIds.splice(index, 1);
            }
            if (this.shownNotificationIds.length == 0) {
                this.$popupContainer.addClass('hidden');
            }
            this.closedNotificationIds.push(id);
        },
        
        showNotifications: function () {
            this.closeNotifications();
            
            var $container = $('<div>').attr('id', 'notifications-panel').css({
                'position': 'absolute',
                'width': '500px',
                'z-index': 1001,
                'right': 0,
                'left': 'auto'
            });
                        
            $container.appendTo(this.$el.find('.notifications-panel-container'));
            
            this.createView('panel', 'Notifications.Panel', {
                el: '#notifications-panel',
            }, function (view) {
                view.render();
                this.listenTo(view, 'all-read', function () {
                    this.hideNotRead();
                    this.$el.find('.badge-circle-warning').remove();
                }, this);
            }.bind(this));
            
            $document = $(document);
            $document.on('mouseup.notification', function (e) {
                if (!$container.is(e.target) && $container.has(e.target).length === 0) {
                    this.closeNotifications();
                }
            }.bind(this));
        },
        
        closeNotifications: function () {
            $container = $('#notifications-panel');
            
            $('#notifications-panel').remove();
            $document = $(document);
            if (this.hasView('panel')) {
                this.getView('panel').remove();
            };
            $document.off('mouseup.notification');
            $container.remove();
        },
        
    });
    
});
