CKEDITOR.editorConfig = function(config)
{
    config.language = 'en';
    config.extraPlugins = 'dropler';
    config.droplerConfig = {
        backend: 's3',
        settings: {
            bucket: 'juscollege-data',
            region: '',
            accessKeyId: 'AKIAIQQWKFAQSWZYPCKQ',
            secretAccessKey: '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'
        }
    };
    //config.uiColor = '#AADC6E';
    config.toolbar_juscollege_toolbar =
        [
            { name: 'clipboard', items : [ 'Source','-','NewPage','Preview','Templates','Print','-','Cut','PasteText','PasteFromWord','-','Undo','Redo' ] },
            { name: 'insert', items : [ 'Image','Flash','Table','HorizontalRule','SpecialChar','Iframe' ] },
            { name: 'basicstyles', items : [ 'Bold','Italic','Underline','Strike','-','Subscript','Superscript','-','RemoveFormat' ] },
            '/',
            { name: 'styles', items : [ 'Styles','Format','Font','FontSize' ] },
            { name: 'links', items : [ 'Link','Unlink','Maximize' ] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote','-','JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock' ] }

        ];

    config.toolbar_mini_toolbar =
        [
            { name: 'styles', items : [ 'Format' ] },
            { name: 'basicstyles', items : [ 'Bold','Italic' ] },
            { name: 'paragraph', items : [ 'NumberedList','BulletedList','-','Outdent','Indent','-','Blockquote' ] },
            { name: 'clipboard', items : [ 'Undo','Redo' ] },
            { name: 'insert', items : [ 'Image','Table','HorizontalRule', 'Link' ] }
        ];
};


// '/' : new line
// '-' : |
//'Smiley'
//'Anchor'
//'About'
//'Find','Replace','-','SelectAll','-','Scayt' 
//'Copy','Paste',
//'PageBreak'

//CKEDITOR.config.contentsCss = '//' + window.location.host + '/assets/application.css';