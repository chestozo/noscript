describe('no.View', function() {

    describe('no.View.define', function() {

        beforeEach(function() {
            sinon.spy(no.View, 'define');
        });

        afterEach(function() {
            no.View.define.restore();
        });

        it('should throw exception if I define View twice', function() {
            no.View.define('test-view-define-twice');
            try {
                no.View.define('test-view-define-twice');
            } catch(e) {}

            expect(no.View.define.getCall(1).threw()).to.be.ok();
        });
    });

    describe('no.View.info events parse', function() {

        no.View.define('test-view-info-events-parse', {
            events: {
                'scroll window': no.pe,
                'scroll document': no.pe,

                'scroll@init window': no.pe,
                'scroll@init document': no.pe,

                'resize window': no.pe,
                'resize document': no.pe,

                'resize@init window': no.pe,
                'resize@init document': no.pe,

                'scroll .foo-init': no.pe,
                'scroll': no.pe,
                'click': no.pe,
                'click .bar-init': no.pe,

                'scroll@show .foo-show': no.pe,
                'scroll@show': no.pe,
                'click@show': no.pe,
                'click@show .bar-show': no.pe,

                'my-global-init-event-short': no.pe,
                'my-local-init-event-short .': no.pe,

                'my-global-init-event@init': no.pe,
                'my-local-init-event@init .': no.pe,

                'my-global-show-event@show': no.pe,
                'my-local-show-event@show .': no.pe
            }
        });

        beforeEach(function() {
            this.viewInfo = no.View.info('test-view-info-events-parse');
        });

        afterEach(function() {
            delete this.viewInfo;
        });

        describe('DOM events', function() {

            it('"initEvents" should be the object', function() {
                expect(this.viewInfo.initEvents).to.be.a('object');
            });

            it('"initEvents.bind" should be the array', function() {
                expect(this.viewInfo.initEvents['bind']).to.be.a('array');
            });

            it('"initEvents.delegate" should be the array', function() {
                expect(this.viewInfo.initEvents['delegate']).to.be.a('array');
            });

            it('"showEvents" should be the object', function() {
                expect(this.viewInfo.showEvents).to.be.a('object');
            });

            it('"showEvents.bind" should be the array', function() {
                expect(this.viewInfo.showEvents['bind']).to.be.a('array');
            });

            it('"showEvents.delegate" should be the array', function() {
                expect(this.viewInfo.showEvents['delegate']).to.be.a('array');
            });

            it('should parse delegated init events properly', function() {
                expect(this.viewInfo.initEvents['delegate']).to.be.eql([
                    ['scroll', 'window', no.pe],
                    ['scroll', 'document', no.pe],

                    ['resize', 'window', no.pe],
                    ['resize', 'document', no.pe],

                    ['scroll', '', no.pe],
                    ['click', '', no.pe],
                    ['click', '.bar-init', no.pe]
                ]);
            });

            it('should parse bind init events properly', function() {
                expect(this.viewInfo.initEvents['bind']).to.be.eql([
                    ['scroll', '.foo-init', no.pe]
                ]);
            });

            it('should parse show events properly', function() {
                expect(this.viewInfo.showEvents['delegate']).to.be.eql([
                    ['scroll', 'window', no.pe],
                    ['scroll', 'document', no.pe],
                    ['resize', 'window', no.pe],
                    ['resize', 'document', no.pe],

                    ['scroll', '', no.pe],
                    ['click', '', no.pe],
                    ['click', '.bar-show', no.pe]
                ]);
            });

            it('should parse show events properly', function() {
                expect(this.viewInfo.showEvents['bind']).to.be.eql([
                    ['scroll', '.foo-show', no.pe]
                ]);
            });

            it('Unbind DOM events on htmldestroy', function() {

                var STATUS = no.V.STATUS;
                var spy = sinon.spy();
                var first_view_node, second_view_node;

                no.View.define(
                    'test-dom-htmldestroy', {
                    events: { 'click': 'onclick' },
                    methods: {
                        onclick: spy
                    }
                });

                // Создаём инстанс view.
                var v = no.View.create('test-dom-htmldestroy', {});
                expect(v.key).to.be.eql('view=test-dom-htmldestroy');
                expect(v.node).to.be(null);

                // Инициализируем html ноду view.
                var node = document.createElement('div');
                node.innerHTML = '<div class="view-test-dom-htmldestroy"/>';
                v._updateHTML(node, {}, {}, { toplevel: true });
                first_view_node = v.node;

                // Проверка, что обработчик события прописался.
                $(first_view_node).trigger('click'); // Должен сработать.
                expect(spy.callCount).to.be.eql(1);
                $(node).trigger('click'); // Не должен сработать, потому что нода view лежит внутри node.
                expect(spy.callCount).to.be.eql(1);

                // Инвалидация view и базовые проверки.
                v.invalidate();
                expect(v.status).to.be.eql(STATUS.INVALID);

                // Пришла новая нода для view. Обновляем html-ю ноду view.
                var node2 = document.createElement('div');
                node2.innerHTML = '<div class="view-test-dom-htmldestroy"/>';
                v._updateHTML(node2, {}, {}, { toplevel: true });
                second_view_node = v.node;

                // Проверяем, что на старой ноде обработчик больше не срабатывает.
                $(first_view_node).trigger('click'); // Не должен сработать, потому что обработчик должен был отписаться.
                expect(spy.callCount).to.be.eql(1);

                // А на новой -- срабатывает.
                $(second_view_node).trigger('click'); // Должен сработать на новой ноде.
                expect(spy.callCount).to.be.eql(2);
            });
        });

        describe('no.events', function() {
            it('"initNoevents" should be the object', function() {
                expect(this.viewInfo.initNoevents).to.be.a('object');
            });

            it('"initNoevents.global" should be the array', function() {
                expect(this.viewInfo.initNoevents['global']).to.be.a('array');
            });

            it('"initNoevents.local" should be the array', function() {
                expect(this.viewInfo.initNoevents['local']).to.be.a('array');
            });

            it('"showNoevents" should be the object', function() {
                expect(this.viewInfo.showNoevents).to.be.a('object');
            });

            it('"showNoevents.global" should be the array', function() {
                expect(this.viewInfo.showNoevents['global']).to.be.a('array');
            });

            it('"showNoevents.local" should be the array', function() {
                expect(this.viewInfo.showNoevents['local']).to.be.a('array');
            });

            it('should parse global init noevents properly', function() {
                expect(this.viewInfo.initNoevents['global']).to.be.eql([
                    ['my-global-init-event-short', no.pe],
                    ['my-global-init-event', no.pe]
                ]);
            });

            it('should parse local init noevents properly', function() {
                expect(this.viewInfo.initNoevents['local']).to.be.eql([
                    ['my-local-init-event-short', no.pe],
                    ['my-local-init-event', no.pe]
                ]);
            });

            it('should parse global show noevents properly', function() {
                expect(this.viewInfo.showNoevents['global']).to.be.eql([
                    ['my-global-show-event', no.pe]
                ]);
            });

            it('should parse local show noevents properly', function() {
                expect(this.viewInfo.showNoevents['local']).to.be.eql([
                    ['my-local-show-event', no.pe]
                ]);
            });
        });
    });

    describe('no.View._bindEventHandlers', function() {

        beforeEach(function() {
            this.view = new no.View();
            this.view.myTestFunc = function() {return this};

            this.eventArr = [
                [ '1', function(){return this} ],
                [ '2', 'myTestFunc' ]
            ];

            this.bindedEventArr = this.view._bindEventHandlers(this.eventArr, 1);
        });

        afterEach(function() {
            delete this.view;
            delete this.eventArr;
            delete this.bindedEventArr;
        });

        it('should return array copy', function() {
            expect(this.bindedEventArr !== this.eventArr).to.be.ok();
        });

        it('should return array with same length', function() {
            expect(this.bindedEventArr.length).to.be(this.eventArr.length);
        });

        it('should process handler as function', function() {
            expect(this.bindedEventArr[0][1]).to.be.a('function');
        });

        it('should return binded function', function() {
            expect(this.bindedEventArr[0][1]()).to.be(this.view);
        });

        it('should return prototype method if handler is string', function() {
            expect(this.bindedEventArr[1][1]).to.be.a('function');
        });

        it('should return binded prototype method if handler is string', function() {
            expect(this.bindedEventArr[1][1]()).to.be(this.view);
        });
    });

    describe('no.View._getEvents', function() {

        beforeEach(function() {
            this.view = new no.View();

            this.bindArr = [1];
            this.delegateArr = [2];
            this.localArr = [3];
            this.globalArr = [4];

            this.view.info = {
                initEvents: {
                    'bind': this.bindArr,
                    'delegate': this.delegateArr
                },
                initNoevents: {
                    'local': this.localArr,
                    'global': this.globalArr
                }
            };

            sinon.stub(this.view, '_bindEventHandlers', function() {
                return [];
            });

            this.result = this.view._getEvents('init');
        });

        afterEach(function() {
            this.view._bindEventHandlers.restore();
            delete this.view;

            delete this.bindArr;
            delete this.delegateArr;
            delete this.localArr;
            delete this.globalArr;
            delete this.result;
        });

        it('should return properly object', function() {
            expect(this.result).to.be.eql({
                'bind': [],
                'delegate': [],
                'no-local': [],
                'no-global': []
            });
        });

        it('should call _bindEventHandlers 4 times', function() {
            expect(this.view._bindEventHandlers.callCount).to.be(4)
        });

        it('should call _bindEventHandlers for delegated events', function() {
            expect(this.view._bindEventHandlers.calledWithExactly(this.delegateArr, 2)).to.be.ok()
        });

        it('should call _bindEventHandlers for bind events', function() {
            expect(this.view._bindEventHandlers.calledWithExactly(this.bindArr, 2)).to.be.ok()
        });

        it('should call _bindEventHandlers for local no.events', function() {
            expect(this.view._bindEventHandlers.calledWithExactly(this.localArr, 1)).to.be.ok()
        });

        it('should call _bindEventHandlers for global no.events', function() {
            expect(this.view._bindEventHandlers.calledWithExactly(this.globalArr, 1)).to.be.ok()
        });
    });
});
