;(function($, window, undefined) {

    var config, text, util, $el, app;

    config = {
        keyLength: 6,
        apiUrlBase: 'http://api.libroipsum.com/'
    };

    text = {
        enterSource: 'Enter your source text:',
        loading: 'Loading...',
        apiFailed: 'Failed to contact LibroIpsum API',
        copied: 'Copied!'
    };

    util = {
        supportsLocalStorage: function() {
            try {
                return 'localStorage' in window && window['localStorage'] !== null;
            } catch (e) {
                return false;
            }
        },

        sources: {
            set: function(key, value) {
                if (util.supportsLocalStorage()) {
                    var store = util.sources._getStore();
                    store[key] = value;
                    util.sources._setStore(store);
                }
            },

            getKeys: function() {
                var keys = [],
                    store;

                if (util.supportsLocalStorage()) {
                    store = util.sources._getStore();

                    for (var key in store) {
                        keys.push(key);
                    }
                }

                return keys;
            },

            get: function(key) {
                if (!util.supportsLocalStorage()) {
                    return undefined;
                }

                var store = util.sources._getStore();
                return store[key];
            },

            _getStore: function() {
                return JSON.parse(localStorage.sources || '{}');
            },

            _setStore: function(obj) {
                localStorage.sources = JSON.stringify(obj);
            }
        },

        parseIntOrDefault: function(numString) {
            var parsed = parseInt(numString, 10);

            if (isNaN(parsed)) {
                return 0;
            }

            return parsed;
        },

        cache: {
            $els: { },
            ipsums: { },

            getJqueryObject: function(selector) {
                if (!(selector in util.cache.$els)) {
                    util.cache.$els[selector] = $(selector);;
                }

                return util.cache.$els[selector];
            },

            getLibroIpsum: function(key, sourceText) {
                if (!(key in util.cache.ipsums)) {
                    util.cache.ipsums[key] = new LibroIpsum(sourceText);
                }

                return util.cache.ipsums[key];
            }
        }
    };

    $el = util.cache.getJqueryObject;

    app = {
        init: function() {
            app.bindEvents();
            app.setupClipboard();
            app.showCustomSources();
        },

        bindEvents: function() {
            $el('#selSource').on('change', app.promptCustom)

            $el('#frmGenerate').on('submit', function(e) {
                e.preventDefault();
                app.generateText();
            });

            $el('#txtWords,#txtParagraphs').on('click', function() {
                this.select();
            });
        },

        setupClipboard: function() {
            var onCopy = function() {
                var $btn = $el('#btnClipboard'),
                    curWidth = $btn.width(),
                    curValue = $btn.html();
                $btn.html(text.copied).width(curWidth);

                setTimeout(function() {
                    $btn.html(curValue).css('width', 'auto');
                }, 3000);
            };

            if ('clipboardData' in window) {
                // Internet Explorer supports direct clipboard access
                $el('#btnClipboard').on('click', function() {
                    var text = $el('#lipsumBody').val();
                    window.clipboardData.setData("Text", text);
                    onCopy();
                });
            } else {
                // Otherwise, use ZeroClipboard library
                var clip = new ZeroClipboard($el('#btnClipboard'), {
                    moviePath: '/obj/ZeroClipboard.swf'
                });

                clip.on('dataRequested', function (client, args) {
                    var text = $el('#lipsumBody').val();
                    clip.setText(text);
                });

                clip.on('complete', onCopy);
            }
        },

        promptCustom: function() {
            if ($('option:selected', this).attr('id') !== 'optCustom') return;

            var source = prompt(text.enterSource);

            if (source != null) {
                var sourceKey = source.substring(0, 40);
                util.sources.set(sourceKey, source);
                app.showCustomSources(sourceKey);
            }
        },

        showCustomSources: function(selectedOption) {
            var keys = util.sources.getKeys(),
                docFrag;

            if (keys.length) {
                docFrag = document.createDocumentFragment();

                for (var i = 0, kl = keys.length; i < kl; i++) {
                    var key = keys[i],
                        opt = document.createElement('option');
                    opt.value = key;
                    opt.innerHTML = key;
                    opt.setAttribute('data-is-custom', 'true');

                    if (typeof selectedOption === 'string' && selectedOption == key) {
                        opt.setAttribute('selected', '');
                    }

                    docFrag.appendChild(opt);
                }

                $el('#optGroupCustom')
                    .find('[data-is-custom]')
                        .remove()
                        .end()
                    .prepend(docFrag);
            }
        },

        generateText: function() {
            var $selectedSource = $el('#selSource').find(':selected'),
                numWords = util.parseIntOrDefault($el('#txtWords').val()),
                numParagraphs = util.parseIntOrDefault($el('#txtParagraphs').val());


            if ($selectedSource.data('isCustom')) {
                var sourceKey = $selectedSource.val(),
                    sourceText = util.sources.get(sourceKey);

                if (sourceText) {
                    var generatedText = '',
                        li = util.cache.getLibroIpsum(sourceKey, sourceText);

                    while (numParagraphs--) {
                        generatedText += li.generate(numWords, config.keyLength) + '\n\n';
                    }

                    app.renderText(generatedText);
                }
            } else if (!app.activeRequest) {
                app.activeRequest = true;
                app.renderText(text.loading);

                var requestUrl = config.apiUrlBase +
                    $selectedSource.val() +
                    '?words=' + numWords +
                    '&paragraphs=' + numParagraphs +
                    '&callback=?';

                $.getJSON(requestUrl).success(function(data) {
                    app.renderText(data.text);
                }).error(function(e) {
                    app.renderText(text.apiFailed);
                }).complete(function() {
                    app.activeRequest = false;
                });
            }
        },

        renderText: function(text) {
            text = text.replace(/\s*$/, '');
            $el('#lipsumBody').val(text);
        }
    };

    $(document).ready(app.init);
    window.LibroIpsumApp = app;
}(this.jQuery, this));
