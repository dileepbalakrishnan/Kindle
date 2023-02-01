if (!window.bridge){
    const isMac = navigator.userAgent.indexOf("Mac") != -1;

    class Bridge {
        constructor() {
            this.callbacks = {};
        }

        postMessage = async (action, body) => {
            return new Promise((resolve, reject) => {
                const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });

                this.callbacks[uuid] = { resolve, reject };

                let message = {
                    'id': uuid,
                    'action': action,
                    'body': body
                };

                if (isMac) {
                    message = JSON.stringify(message);
                }

                window.mazama.postMessage(message);
            });
        };

        onResponse = (response) => {
            if (response.id && this.callbacks[response.id] != null) {
                const callback = this.callbacks[response.id];

                if (response.success && response.body) {
                    callback.resolve(response.body);
                } else {
                    callback.reject(response.body);
                }

                delete this.callbacks[response.id];
            }
        };

        notify = (event) => {
            const customEvent = new CustomEvent(event.eventName, {"detail": event.parameter});
            document.dispatchEvent(customEvent);
        };
    }

    window.bridge = new Bridge();

    if (!isMac) {
        const initEventListener = setInterval(function() {
            if (window.mazama) {
                window.mazama.addEventListener("message", event => {
                    window.bridge.onResponse(event.data);
                });
                clearInterval(initEventListener);
            }
         }, 50);
    }
}