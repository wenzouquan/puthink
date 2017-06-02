define(function(require, exports, module) {
    //定义当前使用的开源组建的版本号
    var OPEN_JS_T = {
        Jpegmeta: "201508011808",
        JpegEncoder: "201508011808",
        ImageCompress: "201508011808"
    };

    var uploadObj;
    window.photo = {

        maxUpload: 8,
        // 上传信息 主要是 id 对应信息
        uploadInfo: {},
        // 上传队列，里面保存的是 id
        uploadQueue: [],
        // 预览队列，里面保存的是 id
        previewQueue: [],
        // 请求对象
        xhr: {},
        // 是否有任务正在上传
        isBusy: false,
        // fid
        fid: 0,
        tid: 0,
        pId: 0,
        qunId: 0,

        countUpload: function() {
            var num = 0;
            $.each(photo.uploadInfo, function(i, n) {
                if (n) {
                    ++num;
                }
            });

            return num;
        },

        getbuilder: function(s, filename, filedata, boundary) {
            var dashdash = '--',
                crlf = '\r\n',
                builder = '';

            for (var i in s.uploadformdata) {
                builder += dashdash;
                builder += boundary;
                builder += crlf;
                builder += 'Content-Disposition: form-data; name="' + i + '"';
                builder += crlf;
                builder += crlf;
                builder += s.uploadformdata[i];
                builder += crlf;
            }

            builder += dashdash;
            builder += boundary;
            builder += crlf;
            builder += 'Content-Disposition: form-data; name="' + s.uploadinputname + '"';
            builder += '; filename="' + filename + '"';
            builder += crlf;

            builder += 'Content-Type: application/octet-stream';
            builder += crlf;
            builder += crlf;

            builder += filedata;
            builder += crlf;

            builder += dashdash;
            builder += boundary;
            builder += dashdash;
            builder += crlf;
            return builder;
        },
        has_upload_list: function(ul, act) {
            var textarea = ul.prev();
            var lis = $(ul).find("li");
            var imgList = new Array();
            $.each(lis, function(i, v) {
                var imgs = {};
                if ($(v).attr("url")) {
                    imgs['file_url'] = $(v).attr("url");
                    imgs['file_name'] = $(v).attr("name");
                    imgList.push(imgs);
                }
            })
            if (imgList.length > 0) {
                textarea.val(JSON.stringify(imgList));
            } else {
                textarea.val("");
            }
            if (act == "del") {
                ul.trigger("BoxUploadDel");
            }
            if (act == "add") {
                ul.trigger("BoxUploadAdd");
            }

            ul.parent().trigger("BoxUpload");
            // console.log('BoxUpload');
        },
        // 图片预览
        uploadPreview: function(id) {

            var reader = new FileReader();
            var uploadBase64;
            var conf = {},
                file = photo.uploadInfo[id].file;

            reader.onload = function(e) {
                var result = this.result;

                // 如果是jpg格式图片，读取图片拍摄方向,自动旋转
                if (file.type == 'image/jpeg') {
                    var jpg = new JpegMeta.JpegFile(result, file.name);
                    // console.log(jpg);
                    if (jpg.tiff) {
                        conf = {
                            maxW: 1200, //目标宽
                            maxH: 1200, //目标高
                            quality: 0.8, //目标jpg图片输出质量
                            orien: 1
                        };
                        //设置旋转
                        if (jpg.tiff.Orientation) {
                            var Orientation = jpg.tiff.Orientation.value;
                            if (Orientation != "" && Orientation != 1) {
                                conf['orien'] = jpg.tiff.Orientation.value;
                            }
                        }

                    }
                }

                // 压缩
                if (ImageCompresser.support()) {
                    var img = new Image();
                    img.onload = function() {
                        try {
                            uploadBase64 = ImageCompresser.getImageBase64(this, conf);
                        } catch (e) {
                            //TOOLS.dialog({content:'压缩图片失败',autoClose:true});
                            $('li#li' + id).remove();
                            return false;
                        }
                        if (uploadBase64.indexOf('data:image') < 0) {
                            // TOOLS.dialog({content:'上传照片格式不支持',autoClose:true});
                            $('li#li' + id).remove();
                            return false;
                        }

                        photo.uploadInfo[id].file = uploadBase64; //e.target.result;
                        photo.uploadInfo[id].filename = file.name;
                        $('li#li' + id).find('img').attr('src', uploadBase64);
                        photo.uploadQueue.push(id);
                    }
                    img.src = ImageCompresser.getFileObjectURL(file);
                } else {
                    uploadBase64 = result;
                    if (uploadBase64.indexOf('data:image') < 0) {
                        //app.alert('上传照片格式不支持');
                        $('li#li' + id).remove();
                        return false;
                    }
                    photo.uploadInfo[id].file = uploadBase64; //e.target.result;
                    photo.uploadInfo[id].filename = file.name;
                    $('li#li' + id).find('img').attr('src', uploadBase64);
                    photo.uploadQueue.push(id);
                }

            }
            reader.readAsBinaryString(photo.uploadInfo[id].file);
        },

        _keys: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
        /*用于BASE64转码*/

        base64decode: function(input) {
            var output = '';
            var chr1, chr2, chr3 = '';
            var enc1, enc2, enc3, enc4 = '';
            var i = 0;
            if (input.length % 4 != 0) {
                return '';
            }
            var base64test = /[^A-Za-z0-9\+\/\=]/g;
            if (base64test.exec(input)) {
                return '';
            }
            do {
                enc1 = photo._keys.indexOf(input.charAt(i++));
                enc2 = photo._keys.indexOf(input.charAt(i++));
                enc3 = photo._keys.indexOf(input.charAt(i++));
                enc4 = photo._keys.indexOf(input.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 != 64) {
                    output += String.fromCharCode(chr2);
                }
                if (enc4 != 64) {
                    output += String.fromCharCode(chr3);
                }
                chr1 = chr2 = chr3 = '';
                enc1 = enc2 = enc3 = enc4 = '';
            } while (i < input.length);
            return output;
        },

        // 创建上传请求
        createUpload: function(id, act) {

            if (!photo.uploadInfo[id]) {
                return false;
            }

            var path = $('li#li' + id).parent().attr("path");
            var exts = $('li#li' + id).parent().attr("exts");
            path = path ? path : "";
            exts = exts ? exts : "";
            // 图片posturl
            var uploadUrl = app.params.apiDomain + '/BoxAddon/Upload/Index/upload/exts/' + exts + "/path/" + path; //alert(uploadUrl);
            //console.log(uploadUrl);
            // $('li#li' + id).prepend('<div class="maskLay"></div>');
            // 产生进度条
            // var progressHtml = '<div class="progress" id="progress' + id + '"><div class="proBar" style="width:0%;"></div></div>';
            //$('li#li' + id).prepend(progressHtml);
            //console.log(progressHtml);
            // $('li#li' + id).find('.maskLay').insertAfter(progressHtml);
            //var formData = new FormData();
            // formData.append('filedata', photo.uploadInfo[id].file);
            // formData.append('uid', uid); 
            /*formData.append('tid', topicid);
        formData.append('hash', uploadHash);
        formData.append('token', S_token);*/

            var progress = function(e) {
                if (e.target.response) {
                    var result = $.parseJSON(e.target.response);
                    if (result.errCode != 0) {
                        // $('#message').val(result.errCode);
                        //TOOLS.dialog({content:'网络不稳定，请稍后重新操作',autoClose:true});
                        removePic(id);
                    }
                }

                var progress = $('#progress' + id).find('.proBar');
                if (e.total == e.loaded) {
                    var percent = 80;
                } else {
                    var percent = 100 * (e.loaded / e.total);
                }
                // 控制进度条不要超出
                if (percent == 100 || percent > 100) {
                    percent = 80;
                }
                //console.log("percent:"+percent);
                progress.css('width', percent + '%');

                // if (percent == 100) {
                //     $('li#li' + id).find('.maskLay').remove();
                //     $('li#li' + id).find('.progress').remove();
                // }
            }

            var removePic = function(id) {
                donePic(id);
                $('li#li' + id).remove();
                var ul = $('li#li' + id).parent();
                photo.has_upload_list(ul, "del");
            }

            var donePic = function(id) {
                photo.isBusy = false;
                if (photo.uploadInfo[id]) {
                    photo.uploadInfo[id].isDone = true;
                }
                photo.xhr[id] = null;

                /*var reportObj = {
                    'a' : 'upload',
                    'uid' : uid || ''
                };
                TOOLS.addReportCount(reportObj);*/
            }

            var complete = function(e) {
                //TOOLS.dialog({content:e.target.response,autoClose:true});
                // 上传结束

                /*
                 返回值(纯文本) 如：DB|0|1051301|1|0
                 DB为固定输出
                 第一个0   代表报错信息，0为正常，非零为出错。
                 第二个1051301 代表成功上传图片的附件aid
                 第三个1   代表是否是图片
                 第四个0   代表导致出错的上传文件容量的尺寸，比如1024000,则限制1024000字节以下的
                 */
                //alert(e.target.response);
                //console.log(e);
                var response = JSON.parse(e.target.response);
                console.log(response);
                //if(response.error)
                //  var attach = response.msg.split('|')
                //console.log(attach);
                //alert(attach.length);
                if (response.error == 0) {
                    var obj = $('li#li' + id);
                    obj.attr("name", response.data.name);
                    obj.attr("url", response.data.file_url);
                    obj.append('<input type="hidden" class="imgList-name" name="imgList[' + id + '][name]" value="' + response.data.name + '" />');
                    obj.append('<input type="hidden"  class="imgList-file_url" name="imgList[' + id + '][file_url]" value="' + response.data.file_url + '" />');
                    $('li#li' + id).find('.maskLay').remove();
                    $('li#li' + id).find('.progress').remove();
                    photo.has_upload_list($(obj).parent(), "add");
                } else {
                    app.alert(response.msg);
                    removePic(id);
                }
                donePic(id);

            }



            var failed = function() {
                photo.isBusy = false;
                photo.uploadInfo[id].isDone = true;
                //TOOLS.dialog({content:'网络断开，请稍后重新操作',autoClose:true});
                removePic(id)
            }

            var abort = function() {
                photo.isBusy = false;
                photo.uploadInfo[id].isDone = true;
                //TOOLS.dialog({content:'上传已取消',autoClose:true});
                removePic(id)
            }

            // 创建 ajax 请求
            photo.xhr[id] = new XMLHttpRequest();
            var boundary = '------multipartformboundary' + (new Date).getTime();
            var s = {
                uploadformdata: { qunid: photo.qunId, topicid: photo.tid },
                uploadinputname: 'filedata',
            };

            var picdata = photo.uploadInfo[id].file.replace(/data:.+;base64,/, '');
            if (typeof atob == 'function') {
                picdata = atob(picdata);
            } else {
                picdata = photo.base64decode(picdata);
            }
            var builder = photo.getbuilder(s, photo.uploadInfo[id].filename, picdata, boundary);
            photo.xhr[id].open("POST", uploadUrl, true);
            photo.xhr[id].setRequestHeader('content-type', 'multipart/form-data; boundary=' + boundary);
            if (!XMLHttpRequest.prototype.sendAsBinary) { //如果XMLHttpRequest没有sendAsBinary
                XMLHttpRequest.prototype.sendAsBinary = function(datastr) {
                    function byteValue(x) {
                        return x.charCodeAt(0) & 0xff;
                    }
                    var ords = Array.prototype.map.call(datastr, byteValue);
                    var ui8a = new Uint8Array(ords);
                    this.send(ui8a.buffer);
                };
            }
            photo.xhr[id].sendAsBinary(builder);
            photo.xhr[id].onerror = function(e) {
                failed();
            };
            photo.xhr[id].onload = function(e) {
                complete(e);
            };
            photo.xhr[id].abort = function(e) {
                abort();
            };
            photo.xhr[id].onsendstream = function(e) {
                progress(e);
            };

        },

        initUpload: function(_this) {

            var html = '<ul class="photoList-content" >';
            html += '<li class="add-image" style="position:relative">';
            html += '<input type="file" style="opacity:0; height:100%;width:100%; position:absolute; top:0px; left:0px" id="initUpload" />';
            html += '</li>';
            html += '</ul>';
            $(_this).html(html);
            var maxUpload = $(_this).attr("upload") ? $(_this).attr("upload") : 1;
            $(_this).find("#initUpload").unbind("change").bind("change", function(e) {
                //  if (photo.isBusy) {
                //     app.alert('上传中，请稍后添加');
                //     return false;
                // }
                uploadObj = $(this);
                var ul = $(this).parents("ul");
                e = e || window.event;
                var fileList = e.target.files;
                if (!fileList.length) {
                    return false;
                }
                for (var i = 0; i < fileList.length; i++) {
                    var file = fileList[i];

                    if (!photo.checkPicSize(file)) {
                        app.alert('文件体积过大');
                        continue;
                    }
                    if (!photo.checkPicType(file)) {
                        app.alert('上传文件格式不支持');
                        continue;
                    }

                    var id = Date.now() + i;
                    // 增加到上传对象中, 上传完成后，修改为 true
                    photo.uploadInfo[id] = {
                        file: file,
                        filename: '',
                        isDone: false,
                    };

                    var html = '<li id="li' + id + '"><div class="photoCut"><img  class="attchImg" ></div>' +
                        '<div class="maskLay"></div>' +
                        '<a href="javascript:" class="cBtn spr db "  _id="' + id + '">关闭</a></li>';
                    $(html).insertBefore($(this).parents("li"));
                    //删除        
                    $(ul).find(".cBtn").unbind("click").bind("click", function() {

                        var id = $(this).attr('_id');
                        var ul = $(this).parents("ul");
                        var li = $(this).parents("li");
                        // 取消这个请求
                        if (photo.xhr[id]) {
                            photo.xhr[id].abort();
                        }
                        // 图片删除
                        $(li).remove();
                        photo.uploadInfo[id] = null;
                        photo.has_upload_list(ul, "del");
                        if ($(ul).find("li").length < maxUpload) {
                            // 图片变少了，显示+号
                            $(ul).find("#initUpload").parent().show();
                        }
                    });
                    photo.previewQueue.push(id);
                }
                if ($(ul).find("li").length > maxUpload) {
                    $(this).parents("li").hide();
                }

                // 把输入框清空
                $(this).val('');
            })

            setInterval(function() {
                // 预览
                setTimeout(function() {
                    if (photo.previewQueue.length) {
                        var jobId = photo.previewQueue.shift();
                        photo.uploadPreview(jobId);
                    }
                }, 1);
                // 上传
                setTimeout(function() {
                    if (!photo.isBusy && photo.uploadQueue.length) {
                        var jobId = photo.uploadQueue.shift();
                        photo.isBusy = true;
                        photo.createUpload(jobId, 'topic');
                    }
                }, 10);
            }, 300);

        },

        // 批量上传上传相关
        initMultipleUpload: function(_this) {     
            photo.uploadInfo={};
            var html = '<ul class="photoList-content" >';
            html += '<li class="add-image" style="position:relative">';
            html += '<input type="file" multiple="multiple"  style="opacity:0; height:100%;width:100%; position:absolute; top:0px; left:0px" id="initUpload" />';
            html += '</li>';
            html += '</ul>';
            $(_this).html(html);
            var maxUpload = $(_this).attr("upload") ? $(_this).attr("upload") : 1;
            var ul = $(_this).find("ul");
            //  if (!photo.isBusy) {
            //     $(document).on("touchstart", "#addPic", function() {
            //         $('#uploadFile').click();
            //     });
            // } else {
            //     app.alert('上传中，请稍后添加');
            //     return false;
            // }
            // 文件表单发生变化时
            $(_this).find("#initUpload").unbind("change").bind("change", function(e) {
                uploadObj = $(this);
                e = e || window.event;
                var fileList = e.target.files;
                if (!fileList.length) {
                    return false;
                }
                if (maxUpload) {
                    photo.maxUpload = maxUpload;
                }
                for (var i = 0; i < fileList.length; i++) {
                    if (photo.countUpload() >= photo.maxUpload) {
                        app.alert('你最多只能上传' + photo.maxUpload + '个文件');
                        break;
                    }

                    var file = fileList[i];

                    if (!photo.checkPicSize(file)) {
                        app.alert('文件体积过大');
                        continue;
                    }
                    // if (!photo.checkPicType(file)) {
                    //             app.alert('上传文件格式不支持');
                    //                continue;
                    //           }

                    var id = Date.now() + i;
                    // 增加到上传对象中, 上传完成后，修改为 true
                    photo.uploadInfo[id] = {
                        file: file,
                        filename: '',
                        isDone: false,
                    };

                    var html = '<li id="li' + id + '"><div class="photoCut"><img  src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC" class="attchImg" alt="photo"></div>' +

                        '<div class="maskLay"></div>' +
                        '<a href="javascript:" class="cBtn spr db "  _id="' + id + '">关闭</a></li>';
                    $(ul).prepend(html);
                    photo.previewQueue.push(id);
                }
                // 图片已经上传了 8 张，隐藏 + 号
                if (photo.countUpload() >= photo.maxUpload) {
                    $(this).parent().hide();
                }

                //删除        
                $(ul).find(".cBtn").unbind("click").bind("click", function() {
                    var id = $(this).attr('_id');
                    var _this = $(this);
                    var li = $(this).parents("li");
                    // 取消这个请求
                    if (photo.xhr[id]) {
                        photo.xhr[id].abort();
                    }

                    // 图片删除
                    $('li#li' + id).remove();
                    photo.uploadInfo[id] = null;
                    photo.has_upload_list(ul, "del");

                    // 图片变少了，显示+号
                    if (photo.countUpload() < photo.maxUpload) {
                        $(ul).find("#initUpload").parent().show();
                    }
                });

                // 把输入框清空
                $(this).val('');

            });



            setInterval(function() {
                // 预览
                setTimeout(function() {
                    if (photo.previewQueue.length) {
                        var jobId = photo.previewQueue.shift();
                        photo.uploadPreview(jobId);
                    }
                }, 1);
                // 上传
                setTimeout(function() {
                    if (!photo.isBusy && photo.uploadQueue.length) {
                        var jobId = photo.uploadQueue.shift();
                        photo.isBusy = true;
                        photo.createUpload(jobId, 'topic');
                    }
                }, 10);
            }, 300);

        },

        // 检查图片大小
        checkPicSize: function(file) {
            // 8M
            if (file.size > 10000000) {
                return false;
            }
            return true;
        },
        // 检查图片类型
        checkPicType: function(file) {

            if (file.type.indexOf('image/') == 0) {
                return true;
            } else {
                var index = file.name.lastIndexOf('.');
                var extName = file.name.substring(index + 1).toLowerCase();
                if (extName == 'jpg' || extName == 'jpeg' || extName == 'png' || extName == 'gif') {
                    return true;
                }
                return false;
            }
        }

    };
    /******jpegmeta.js*******/
    var JpegMeta = {};
    this.JpegMeta = JpegMeta;
    JpegMeta.parseNum = function parseNum(endian, data, offset, size) {
        var i;
        var ret;
        var big_endian = (endian === ">");
        if (offset === undefined) offset = 0;
        if (size === undefined) size = data.length - offset;
        for (big_endian ? i = offset : i = offset + size - 1; big_endian ? i < offset + size : i >= offset; big_endian ? i++ : i--) {
            ret <<= 8;
            ret += data.charCodeAt(i);
        }
        return ret;
    };
    JpegMeta.parseSnum = function parseSnum(endian, data, offset, size) {
        var i;
        var ret;
        var neg;
        var big_endian = (endian === ">");
        if (offset === undefined) offset = 0;
        if (size === undefined) size = data.length - offset;
        for (big_endian ? i = offset : i = offset + size - 1; big_endian ? i < offset + size : i >= offset; big_endian ? i++ : i--) {
            if (neg === undefined) {
                neg = (data.charCodeAt(i) & 0x80) === 0x80;
            }
            ret <<= 8;
            ret += neg ? ~data.charCodeAt(i) & 0xff : data.charCodeAt(i);
        }
        if (neg) {
            ret += 1;
            ret *= -1;
        }
        return ret;
    };
    JpegMeta.Rational = function Rational(num, den) {
        this.num = num;
        this.den = den || 1;
        return this;
    };
    JpegMeta.Rational.prototype.toString = function toString() {
        if (this.num === 0) {
            return "" + this.num;
        }
        if (this.den === 1) {
            return "" + this.num;
        }
        if (this.num === 1) {
            return this.num + " / " + this.den;
        }
        return this.num / this.den;
    };
    JpegMeta.Rational.prototype.asFloat = function asFloat() {
        return this.num / this.den;
    };
    JpegMeta.MetaGroup = function MetaGroup(fieldName, description) {
        this.fieldName = fieldName;
        this.description = description;
        this.metaProps = {};
        return this;
    };
    JpegMeta.MetaGroup.prototype._addProperty = function _addProperty(fieldName, description, value) {
        var property = new JpegMeta.MetaProp(fieldName, description, value);
        this[property.fieldName] = property;
        this.metaProps[property.fieldName] = property;
    };
    JpegMeta.MetaGroup.prototype.toString = function toString() {
        return "[MetaGroup " + this.description + "]";
    };
    JpegMeta.MetaProp = function MetaProp(fieldName, description, value) {
        this.fieldName = fieldName;
        this.description = description;
        this.value = value;
        return this;
    };
    JpegMeta.MetaProp.prototype.toString = function toString() {
        return "" + this.value;
    };
    JpegMeta.JpegFile = function JpegFile(binary_data, filename) {
        var break_segment = this._SOS;
        this.metaGroups = {};
        this._binary_data = binary_data;
        this.filename = filename;
        var pos = 0;
        var pos_start_of_segment = 0;
        var delim;
        var mark;
        var _mark;
        var segsize;
        var headersize;
        var mark_code;
        var mark_fn;
        if (this._binary_data.slice(0, 2) !== this._SOI_MARKER) {
            throw new Error("Doesn't look like a JPEG file. First two bytes are " + this._binary_data.charCodeAt(0) + "," + this._binary_data.charCodeAt(1) + ".");
        }
        pos += 2;
        while (pos < this._binary_data.length) {
            delim = this._binary_data.charCodeAt(pos++);
            mark = this._binary_data.charCodeAt(pos++);
            console.log(mark.toString(16))
            pos_start_of_segment = pos;
            if (delim != this._DELIM) {
                break;
            }
            if (mark === break_segment) {
                break;
            }
            headersize = JpegMeta.parseNum(">", this._binary_data, pos, 2);
            console.log('headsize=' + headersize)
            pos += headersize;
            while (pos < this._binary_data.length) {
                delim = this._binary_data.charCodeAt(pos++);
                if (delim == this._DELIM) {
                    _mark = this._binary_data.charCodeAt(pos++);
                    if (_mark != 0x0) {
                        pos -= 2;
                        break;
                    }
                }
            }
            segsize = pos - pos_start_of_segment;
            if (this._markers[mark]) {
                mark_code = this._markers[mark][0];
                mark_fn = this._markers[mark][1];
            } else {
                mark_code = "UNKN";
                mark_fn = undefined;
            }
            if (mark_fn) {
                this[mark_fn](mark, pos_start_of_segment + 2);
            }
        }
        if (this.general === undefined) {
            throw Error("Invalid JPEG file.");
        }
        return this;
    };
    this.JpegMeta.JpegFile.prototype.toString = function() {
        return "[JpegFile " + this.filename + " " + this.general.type + " " + this.general.pixelWidth + "x" + this.general.pixelHeight + " Depth: " + this.general.depth + "]";
    };
    this.JpegMeta.JpegFile.prototype._SOI_MARKER = '\xff\xd8';
    this.JpegMeta.JpegFile.prototype._DELIM = 0xff;
    this.JpegMeta.JpegFile.prototype._EOI = 0xd9;
    this.JpegMeta.JpegFile.prototype._SOS = 0xda;
    this.JpegMeta.JpegFile.prototype._sofHandler = function _sofHandler(mark, pos) {
        if (this.general !== undefined) {
            throw Error("Unexpected multiple-frame image");
        }
        this._addMetaGroup("general", "General");
        this.general._addProperty("depth", "Depth", JpegMeta.parseNum(">", this._binary_data, pos, 1));
        this.general._addProperty("pixelHeight", "Pixel Height", JpegMeta.parseNum(">", this._binary_data, pos + 1, 2));
        this.general._addProperty("pixelWidth", "Pixel Width", JpegMeta.parseNum(">", this._binary_data, pos + 3, 2));
        this.general._addProperty("type", "Type", this._markers[mark][2]);
    };
    this.JpegMeta.JpegFile.prototype._JFIF_IDENT = "JFIF\x00";
    this.JpegMeta.JpegFile.prototype._JFXX_IDENT = "JFXX\x00";
    this.JpegMeta.JpegFile.prototype._EXIF_IDENT = "Exif\x00";
    this.JpegMeta.JpegFile.prototype._types = {
        1: ["BYTE", 1],
        2: ["ASCII", 1],
        3: ["SHORT", 2],
        4: ["LONG", 4],
        5: ["RATIONAL", 8],
        6: ["SBYTE", 1],
        7: ["UNDEFINED", 1],
        8: ["SSHORT", 2],
        9: ["SLONG", 4],
        10: ["SRATIONAL", 8],
        11: ["FLOAT", 4],
        12: ["DOUBLE", 8]
    };
    this.JpegMeta.JpegFile.prototype._tifftags = {
        256: ["Image width", "ImageWidth"],
        257: ["Image height", "ImageLength"],
        258: ["Number of bits per component", "BitsPerSample"],
        259: ["Compression scheme", "Compression", {
            1: "uncompressed",
            6: "JPEG compression"
        }],
        262: ["Pixel composition", "PhotmetricInerpretation", {
            2: "RGB",
            6: "YCbCr"
        }],
        274: ["Orientation of image", "Orientation", {
            1: "Normal",
            2: "Reverse?",
            3: "Upside-down",
            4: "Upside-down Reverse",
            5: "90 degree CW",
            6: "90 degree CW reverse",
            7: "90 degree CCW",
            8: "90 degree CCW reverse"
        }],
        277: ["Number of components", "SamplesPerPixel"],
        284: ["Image data arrangement", "PlanarConfiguration", {
            1: "chunky format",
            2: "planar format"
        }],
        530: ["Subsampling ratio of Y to C", "YCbCrSubSampling"],
        531: ["Y and C positioning", "YCbCrPositioning", {
            1: "centered",
            2: "co-sited"
        }],
        282: ["X Resolution", "XResolution"],
        283: ["Y Resolution", "YResolution"],
        296: ["Resolution Unit", "ResolutionUnit", {
            2: "inches",
            3: "centimeters"
        }],
        273: ["Image data location", "StripOffsets"],
        278: ["Number of rows per strip", "RowsPerStrip"],
        279: ["Bytes per compressed strip", "StripByteCounts"],
        513: ["Offset to JPEG SOI", "JPEGInterchangeFormat"],
        514: ["Bytes of JPEG Data", "JPEGInterchangeFormatLength"],
        301: ["Transfer function", "TransferFunction"],
        318: ["White point chromaticity", "WhitePoint"],
        319: ["Chromaticities of primaries", "PrimaryChromaticities"],
        529: ["Color space transformation matrix coefficients", "YCbCrCoefficients"],
        532: ["Pair of black and white reference values", "ReferenceBlackWhite"],
        306: ["Date and time", "DateTime"],
        270: ["Image title", "ImageDescription"],
        271: ["Make", "Make"],
        272: ["Model", "Model"],
        305: ["Software", "Software"],
        315: ["Person who created the image", "Artist"],
        316: ["Host Computer", "HostComputer"],
        33432: ["Copyright holder", "Copyright"],
        34665: ["Exif tag", "ExifIfdPointer"],
        34853: ["GPS tag", "GPSInfoIfdPointer"]
    };
    this.JpegMeta.JpegFile.prototype._exiftags = {
        36864: ["Exif Version", "ExifVersion"],
        40960: ["FlashPix Version", "FlashpixVersion"],
        40961: ["Color Space", "ColorSpace"],
        37121: ["Meaning of each component", "ComponentsConfiguration"],
        37122: ["Compressed Bits Per Pixel", "CompressedBitsPerPixel"],
        40962: ["Pixel X Dimension", "PixelXDimension"],
        40963: ["Pixel Y Dimension", "PixelYDimension"],
        37500: ["Manufacturer notes", "MakerNote"],
        37510: ["User comments", "UserComment"],
        40964: ["Related audio file", "RelatedSoundFile"],
        36867: ["Date Time Original", "DateTimeOriginal"],
        36868: ["Date Time Digitized", "DateTimeDigitized"],
        37520: ["DateTime subseconds", "SubSecTime"],
        37521: ["DateTimeOriginal subseconds", "SubSecTimeOriginal"],
        37522: ["DateTimeDigitized subseconds", "SubSecTimeDigitized"],
        33434: ["Exposure time", "ExposureTime"],
        33437: ["FNumber", "FNumber"],
        34850: ["Exposure program", "ExposureProgram"],
        34852: ["Spectral sensitivity", "SpectralSensitivity"],
        34855: ["ISO Speed Ratings", "ISOSpeedRatings"],
        34856: ["Optoelectric coefficient", "OECF"],
        37377: ["Shutter Speed", "ShutterSpeedValue"],
        37378: ["Aperture Value", "ApertureValue"],
        37379: ["Brightness", "BrightnessValue"],
        37380: ["Exposure Bias Value", "ExposureBiasValue"],
        37381: ["Max Aperture Value", "MaxApertureValue"],
        37382: ["Subject Distance", "SubjectDistance"],
        37383: ["Metering Mode", "MeteringMode"],
        37384: ["Light Source", "LightSource"],
        37385: ["Flash", "Flash"],
        37386: ["Focal Length", "FocalLength"],
        37396: ["Subject Area", "SubjectArea"],
        41483: ["Flash Energy", "FlashEnergy"],
        41484: ["Spatial Frequency Response", "SpatialFrequencyResponse"],
        41486: ["Focal Plane X Resolution", "FocalPlaneXResolution"],
        41487: ["Focal Plane Y Resolution", "FocalPlaneYResolution"],
        41488: ["Focal Plane Resolution Unit", "FocalPlaneResolutionUnit"],
        41492: ["Subject Location", "SubjectLocation"],
        41493: ["Exposure Index", "ExposureIndex"],
        41495: ["Sensing Method", "SensingMethod"],
        41728: ["File Source", "FileSource"],
        41729: ["Scene Type", "SceneType"],
        41730: ["CFA Pattern", "CFAPattern"],
        41985: ["Custom Rendered", "CustomRendered"],
        41986: ["Exposure Mode", "Exposure Mode"],
        41987: ["White Balance", "WhiteBalance"],
        41988: ["Digital Zoom Ratio", "DigitalZoomRatio"],
        41990: ["Scene Capture Type", "SceneCaptureType"],
        41991: ["Gain Control", "GainControl"],
        41992: ["Contrast", "Contrast"],
        41993: ["Saturation", "Saturation"],
        41994: ["Sharpness", "Sharpness"],
        41995: ["Device settings description", "DeviceSettingDescription"],
        41996: ["Subject distance range", "SubjectDistanceRange"],
        42016: ["Unique image ID", "ImageUniqueID"],
        40965: ["Interoperability tag", "InteroperabilityIFDPointer"]
    };
    this.JpegMeta.JpegFile.prototype._gpstags = {
        0: ["GPS tag version", "GPSVersionID"],
        1: ["North or South Latitude", "GPSLatitudeRef"],
        2: ["Latitude", "GPSLatitude"],
        3: ["East or West Longitude", "GPSLongitudeRef"],
        4: ["Longitude", "GPSLongitude"],
        5: ["Altitude reference", "GPSAltitudeRef"],
        6: ["Altitude", "GPSAltitude"],
        7: ["GPS time (atomic clock)", "GPSTimeStamp"],
        8: ["GPS satellites usedd for measurement", "GPSSatellites"],
        9: ["GPS receiver status", "GPSStatus"],
        10: ["GPS mesaurement mode", "GPSMeasureMode"],
        11: ["Measurement precision", "GPSDOP"],
        12: ["Speed unit", "GPSSpeedRef"],
        13: ["Speed of GPS receiver", "GPSSpeed"],
        14: ["Reference for direction of movement", "GPSTrackRef"],
        15: ["Direction of movement", "GPSTrack"],
        16: ["Reference for direction of image", "GPSImgDirectionRef"],
        17: ["Direction of image", "GPSImgDirection"],
        18: ["Geodetic survey data used", "GPSMapDatum"],
        19: ["Reference for latitude of destination", "GPSDestLatitudeRef"],
        20: ["Latitude of destination", "GPSDestLatitude"],
        21: ["Reference for longitude of destination", "GPSDestLongitudeRef"],
        22: ["Longitude of destination", "GPSDestLongitude"],
        23: ["Reference for bearing of destination", "GPSDestBearingRef"],
        24: ["Bearing of destination", "GPSDestBearing"],
        25: ["Reference for distance to destination", "GPSDestDistanceRef"],
        26: ["Distance to destination", "GPSDestDistance"],
        27: ["Name of GPS processing method", "GPSProcessingMethod"],
        28: ["Name of GPS area", "GPSAreaInformation"],
        29: ["GPS Date", "GPSDateStamp"],
        30: ["GPS differential correction", "GPSDifferential"]
    };
    this.JpegMeta.JpegFile.prototype._markers = {
        0xc0: ["SOF0", "_sofHandler", "Baseline DCT"],
        0xc1: ["SOF1", "_sofHandler", "Extended sequential DCT"],
        0xc2: ["SOF2", "_sofHandler", "Progressive DCT"],
        0xc3: ["SOF3", "_sofHandler", "Lossless (sequential)"],
        0xc5: ["SOF5", "_sofHandler", "Differential sequential DCT"],
        0xc6: ["SOF6", "_sofHandler", "Differential progressive DCT"],
        0xc7: ["SOF7", "_sofHandler", "Differential lossless (sequential)"],
        0xc8: ["JPG", null, "Reserved for JPEG extensions"],
        0xc9: ["SOF9", "_sofHandler", "Extended sequential DCT"],
        0xca: ["SOF10", "_sofHandler", "Progressive DCT"],
        0xcb: ["SOF11", "_sofHandler", "Lossless (sequential)"],
        0xcd: ["SOF13", "_sofHandler", "Differential sequential DCT"],
        0xce: ["SOF14", "_sofHandler", "Differential progressive DCT"],
        0xcf: ["SOF15", "_sofHandler", "Differential lossless (sequential)"],
        0xc4: ["DHT", null, "Define Huffman table(s)"],
        0xcc: ["DAC", null, "Define arithmetic coding conditioning(s)"],
        0xd0: ["RST0", null, "Restart with modulo 8 count “0”"],
        0xd1: ["RST1", null, "Restart with modulo 8 count “1”"],
        0xd2: ["RST2", null, "Restart with modulo 8 count “2”"],
        0xd3: ["RST3", null, "Restart with modulo 8 count “3”"],
        0xd4: ["RST4", null, "Restart with modulo 8 count “4”"],
        0xd5: ["RST5", null, "Restart with modulo 8 count “5”"],
        0xd6: ["RST6", null, "Restart with modulo 8 count “6”"],
        0xd7: ["RST7", null, "Restart with modulo 8 count “7”"],
        0xd8: ["SOI", null, "Start of image"],
        0xd9: ["EOI", null, "End of image"],
        0xda: ["SOS", null, "Start of scan"],
        0xdb: ["DQT", null, "Define quantization table(s)"],
        0xdc: ["DNL", null, "Define number of lines"],
        0xdd: ["DRI", null, "Define restart interval"],
        0xde: ["DHP", null, "Define hierarchical progression"],
        0xdf: ["EXP", null, "Expand reference component(s)"],
        0xe0: ["APP0", "_app0Handler", "Reserved for application segments"],
        0xe1: ["APP1", "_app1Handler"],
        0xe2: ["APP2", null],
        0xe3: ["APP3", null],
        0xe4: ["APP4", null],
        0xe5: ["APP5", null],
        0xe6: ["APP6", null],
        0xe7: ["APP7", null],
        0xe8: ["APP8", null],
        0xe9: ["APP9", null],
        0xea: ["APP10", null],
        0xeb: ["APP11", null],
        0xec: ["APP12", null],
        0xed: ["APP13", null],
        0xee: ["APP14", null],
        0xef: ["APP15", null],
        0xf0: ["JPG0", null],
        0xf1: ["JPG1", null],
        0xf2: ["JPG2", null],
        0xf3: ["JPG3", null],
        0xf4: ["JPG4", null],
        0xf5: ["JPG5", null],
        0xf6: ["JPG6", null],
        0xf7: ["JPG7", null],
        0xf8: ["JPG8", null],
        0xf9: ["JPG9", null],
        0xfa: ["JPG10", null],
        0xfb: ["JPG11", null],
        0xfc: ["JPG12", null],
        0xfd: ["JPG13", null],
        0xfe: ["COM", null],
        0x01: ["JPG13", null]
    };
    this.JpegMeta.JpegFile.prototype._addMetaGroup = function _addMetaGroup(name, description) {
        var group = new JpegMeta.MetaGroup(name, description);
        this[group.fieldName] = group;
        this.metaGroups[group.fieldName] = group;
        return group;
    };
    this.JpegMeta.JpegFile.prototype._parseIfd = function _parseIfd(endian, _binary_data, base, ifd_offset, tags, name, description) {
        var num_fields = JpegMeta.parseNum(endian, _binary_data, base + ifd_offset, 2);
        var i, j;
        var tag_base;
        var tag_field;
        var type, type_field, type_size;
        var num_values;
        var value_offset;
        var value;
        var _val;
        var num;
        var den;
        var group;
        group = this._addMetaGroup(name, description);
        for (var i = 0; i < num_fields; i++) {
            tag_base = base + ifd_offset + 2 + (i * 12);
            tag_field = JpegMeta.parseNum(endian, _binary_data, tag_base, 2);
            console.log('tag-field=' + tag_field)
            type_field = JpegMeta.parseNum(endian, _binary_data, tag_base + 2, 2);
            num_values = JpegMeta.parseNum(endian, _binary_data, tag_base + 4, 4);
            value_offset = JpegMeta.parseNum(endian, _binary_data, tag_base + 8, 4);
            if (this._types[type_field] === undefined) {
                continue;
            }
            type = this._types[type_field][0];
            type_size = this._types[type_field][1];
            if (type_size * num_values <= 4) {
                value_offset = tag_base + 8;
            } else {
                value_offset = base + value_offset;
            }
            if (type == "UNDEFINED") {
                f = _binary_data.slice(value_offset, value_offset + num_values);
            } else if (type == "ASCII") {
                value = _binary_data.slice(value_offset, value_offset + num_values);
                value = value.split('\x00')[0];
            } else {
                value = new Array();
                for (j = 0; j < num_values; j++, value_offset += type_size) {
                    if (type == "BYTE" || type == "SHORT" || type == "LONG") {
                        value.push(JpegMeta.parseNum(endian, _binary_data, value_offset, type_size));
                    }
                    if (type == "SBYTE" || type == "SSHORT" || type == "SLONG") {
                        value.push(JpegMeta.parseSnum(endian, _binary_data, value_offset, type_size));
                    }
                    if (type == "RATIONAL") {
                        num = JpegMeta.parseNum(endian, _binary_data, value_offset, 4);
                        den = JpegMeta.parseNum(endian, _binary_data, value_offset + 4, 4);
                        value.push(new JpegMeta.Rational(num, den));
                    }
                    if (type == "SRATIONAL") {
                        num = JpegMeta.parseSnum(endian, _binary_data, value_offset, 4);
                        den = JpegMeta.parseSnum(endian, _binary_data, value_offset + 4, 4);
                        value.push(new JpegMeta.Rational(num, den));
                    }
                    value.push();
                }
                if (num_values === 1) {
                    value = value[0];
                }
            }
            if (tags[tag_field] !== undefined) {
                group._addProperty(tags[tag_field][1], tags[tag_field][0], value);
            }
        }
    };
    this.JpegMeta.JpegFile.prototype._jfifHandler = function _jfifHandler(mark, pos) {
        if (this.jfif !== undefined) {
            throw Error("Multiple JFIF segments found");
        }
        this._addMetaGroup("jfif", "JFIF");
        this.jfif._addProperty("version_major", "Version Major", this._binary_data.charCodeAt(pos + 5));
        this.jfif._addProperty("version_minor", "Version Minor", this._binary_data.charCodeAt(pos + 6));
        this.jfif._addProperty("version", "JFIF Version", this.jfif.version_major.value + "." + this.jfif.version_minor.value);
        this.jfif._addProperty("units", "Density Unit", this._binary_data.charCodeAt(pos + 7));
        this.jfif._addProperty("Xdensity", "X density", JpegMeta.parseNum(">", this._binary_data, pos + 8, 2));
        this.jfif._addProperty("Ydensity", "Y Density", JpegMeta.parseNum(">", this._binary_data, pos + 10, 2));
        this.jfif._addProperty("Xthumbnail", "X Thumbnail", JpegMeta.parseNum(">", this._binary_data, pos + 12, 1));
        this.jfif._addProperty("Ythumbnail", "Y Thumbnail", JpegMeta.parseNum(">", this._binary_data, pos + 13, 1));
    };
    this.JpegMeta.JpegFile.prototype._app0Handler = function app0Handler(mark, pos) {
        var ident = this._binary_data.slice(pos, pos + 5);
        if (ident == this._JFIF_IDENT) {
            this._jfifHandler(mark, pos);
        } else if (ident == this._JFXX_IDENT) {} else {}
    };
    this.JpegMeta.JpegFile.prototype._app1Handler = function _app1Handler(mark, pos) {
        var ident = this._binary_data.slice(pos, pos + 5);
        if (ident == this._EXIF_IDENT) {
            this._exifHandler(mark, pos + 6);
        } else {}
    };
    JpegMeta.JpegFile.prototype._exifHandler = function _exifHandler(mark, pos) {
        if (this.exif !== undefined) {
            throw new Error("Multiple JFIF segments found");
        }
        var endian;
        var magic_field;
        var ifd_offset;
        var primary_ifd, exif_ifd, gps_ifd;
        var endian_field = this._binary_data.slice(pos, pos + 2);
        if (endian_field === "II") {
            endian = "<";
        } else if (endian_field === "MM") {
            endian = ">";
        } else {
            throw new Error("Malformed TIFF meta-data. Unknown endianess: " + endian_field);
        }
        magic_field = JpegMeta.parseNum(endian, this._binary_data, pos + 2, 2);
        if (magic_field !== 42) {
            throw new Error("Malformed TIFF meta-data. Bad magic: " + magic_field);
        }
        ifd_offset = JpegMeta.parseNum(endian, this._binary_data, pos + 4, 4);
        this._parseIfd(endian, this._binary_data, pos, ifd_offset, this._tifftags, "tiff", "TIFF");
        if (this.tiff.ExifIfdPointer) {
            console.log('has pointer1')
            this._parseIfd(endian, this._binary_data, pos, this.tiff.ExifIfdPointer.value, this._exiftags, "exif", "Exif");
        }
        if (this.tiff.GPSInfoIfdPointer) {
            this._parseIfd(endian, this._binary_data, pos, this.tiff.GPSInfoIfdPointer.value, this._gpstags, "gps", "GPS");
            if (this.gps.GPSLatitude) {
                var latitude;
                latitude = this.gps.GPSLatitude.value[0].asFloat() + (1 / 60) * this.gps.GPSLatitude.value[1].asFloat() + (1 / 3600) * this.gps.GPSLatitude.value[2].asFloat();
                if (this.gps.GPSLatitudeRef.value === "S") {
                    latitude = -latitude;
                }
                this.gps._addProperty("latitude", "Dec. Latitude", latitude);
            }
            if (this.gps.GPSLongitude) {
                var longitude;
                longitude = this.gps.GPSLongitude.value[0].asFloat() + (1 / 60) * this.gps.GPSLongitude.value[1].asFloat() + (1 / 3600) * this.gps.GPSLongitude.value[2].asFloat();
                if (this.gps.GPSLongitudeRef.value === "W") {
                    longitude = -longitude;
                }
                this.gps._addProperty("longitude", "Dec. Longitude", longitude);
            }
        }
    };

    /*****jpeg.encoder.basic.js****/
    function JPEGEncoder(quality) {
        var self = this;
        var fround = Math.round;
        var ffloor = Math.floor;
        var YTable = new Array(64);
        var UVTable = new Array(64);
        var fdtbl_Y = new Array(64);
        var fdtbl_UV = new Array(64);
        var YDC_HT;
        var UVDC_HT;
        var YAC_HT;
        var UVAC_HT;
        var bitcode = new Array(65535);
        var category = new Array(65535);
        var outputfDCTQuant = new Array(64);
        var DU = new Array(64);
        var byteout = [];
        var bytenew = 0;
        var bytepos = 7;
        var YDU = new Array(64);
        var UDU = new Array(64);
        var VDU = new Array(64);
        var clt = new Array(256);
        var RGB_YUV_TABLE = new Array(2048);
        var currentQuality;
        var ZigZag = [0, 1, 5, 6, 14, 15, 27, 28, 2, 4, 7, 13, 16, 26, 29, 42, 3, 8, 12, 17, 25, 30, 41, 43, 9, 11, 18, 24, 31, 40, 44, 53, 10, 19, 23, 32, 39, 45, 52, 54, 20, 22, 33, 38, 46, 51, 55, 60, 21, 34, 37, 47, 50, 56, 59, 61, 35, 36, 48, 49, 57, 58, 62, 63];
        var std_dc_luminance_nrcodes = [0, 0, 1, 5, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0];
        var std_dc_luminance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_luminance_nrcodes = [0, 0, 2, 1, 3, 3, 2, 4, 3, 5, 5, 4, 4, 0, 0, 1, 0x7d];
        var std_ac_luminance_values = [0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06, 0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42, 0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0x09, 0x0a, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x25, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x34, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe1, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf1, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];
        var std_dc_chrominance_nrcodes = [0, 0, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0];
        var std_dc_chrominance_values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
        var std_ac_chrominance_nrcodes = [0, 0, 2, 1, 2, 4, 4, 3, 4, 7, 5, 4, 4, 0, 1, 2, 0x77];
        var std_ac_chrominance_values = [0x00, 0x01, 0x02, 0x03, 0x11, 0x04, 0x05, 0x21, 0x31, 0x06, 0x12, 0x41, 0x51, 0x07, 0x61, 0x71, 0x13, 0x22, 0x32, 0x81, 0x08, 0x14, 0x42, 0x91, 0xa1, 0xb1, 0xc1, 0x09, 0x23, 0x33, 0x52, 0xf0, 0x15, 0x62, 0x72, 0xd1, 0x0a, 0x16, 0x24, 0x34, 0xe1, 0x25, 0xf1, 0x17, 0x18, 0x19, 0x1a, 0x26, 0x27, 0x28, 0x29, 0x2a, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x49, 0x4a, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x92, 0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xaa, 0xb2, 0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xd2, 0xd3, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd9, 0xda, 0xe2, 0xe3, 0xe4, 0xe5, 0xe6, 0xe7, 0xe8, 0xe9, 0xea, 0xf2, 0xf3, 0xf4, 0xf5, 0xf6, 0xf7, 0xf8, 0xf9, 0xfa];

        function initQuantTables(sf) {
            var YQT = [16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55, 14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62, 18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92, 49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99];
            for (var i = 0; i < 64; i++) {
                var t = ffloor((YQT[i] * sf + 50) / 100);
                if (t < 1) { t = 1; } else if (t > 255) { t = 255; }
                YTable[ZigZag[i]] = t;
            }
            var UVQT = [17, 18, 24, 47, 99, 99, 99, 99, 18, 21, 26, 66, 99, 99, 99, 99, 24, 26, 56, 99, 99, 99, 99, 99, 47, 66, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99, 99];
            for (var j = 0; j < 64; j++) {
                var u = ffloor((UVQT[j] * sf + 50) / 100);
                if (u < 1) { u = 1; } else if (u > 255) { u = 255; }
                UVTable[ZigZag[j]] = u;
            }
            var aasf = [1.0, 1.387039845, 1.306562965, 1.175875602, 1.0, 0.785694958, 0.541196100, 0.275899379];
            var k = 0;
            for (var row = 0; row < 8; row++) {
                for (var col = 0; col < 8; col++) {
                    fdtbl_Y[k] = (1.0 / (YTable[ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
                    fdtbl_UV[k] = (1.0 / (UVTable[ZigZag[k]] * aasf[row] * aasf[col] * 8.0));
                    k++;
                }
            }
        }

        function computeHuffmanTbl(nrcodes, std_table) {
            var codevalue = 0;
            var pos_in_table = 0;
            var HT = new Array();
            for (var k = 1; k <= 16; k++) {
                for (var j = 1; j <= nrcodes[k]; j++) {
                    HT[std_table[pos_in_table]] = [];
                    HT[std_table[pos_in_table]][0] = codevalue;
                    HT[std_table[pos_in_table]][1] = k;
                    pos_in_table++;
                    codevalue++;
                }
                codevalue *= 2;
            }
            return HT;
        }

        function initHuffmanTbl() {
            YDC_HT = computeHuffmanTbl(std_dc_luminance_nrcodes, std_dc_luminance_values);
            UVDC_HT = computeHuffmanTbl(std_dc_chrominance_nrcodes, std_dc_chrominance_values);
            YAC_HT = computeHuffmanTbl(std_ac_luminance_nrcodes, std_ac_luminance_values);
            UVAC_HT = computeHuffmanTbl(std_ac_chrominance_nrcodes, std_ac_chrominance_values);
        }

        function initCategoryNumber() {
            var nrlower = 1;
            var nrupper = 2;
            for (var cat = 1; cat <= 15; cat++) {
                for (var nr = nrlower; nr < nrupper; nr++) {
                    category[32767 + nr] = cat;
                    bitcode[32767 + nr] = [];
                    bitcode[32767 + nr][1] = cat;
                    bitcode[32767 + nr][0] = nr;
                }
                for (var nrneg = -(nrupper - 1); nrneg <= -nrlower; nrneg++) {
                    category[32767 + nrneg] = cat;
                    bitcode[32767 + nrneg] = [];
                    bitcode[32767 + nrneg][1] = cat;
                    bitcode[32767 + nrneg][0] = nrupper - 1 + nrneg;
                }
                nrlower <<= 1;
                nrupper <<= 1;
            }
        }

        function initRGBYUVTable() {
            for (var i = 0; i < 256; i++) {
                RGB_YUV_TABLE[i] = 19595 * i;
                RGB_YUV_TABLE[(i + 256) >> 0] = 38470 * i;
                RGB_YUV_TABLE[(i + 512) >> 0] = 7471 * i + 0x8000;
                RGB_YUV_TABLE[(i + 768) >> 0] = -11059 * i;
                RGB_YUV_TABLE[(i + 1024) >> 0] = -21709 * i;
                RGB_YUV_TABLE[(i + 1280) >> 0] = 32768 * i + 0x807FFF;
                RGB_YUV_TABLE[(i + 1536) >> 0] = -27439 * i;
                RGB_YUV_TABLE[(i + 1792) >> 0] = -5329 * i;
            }
        }

        function writeBits(bs) {
            var value = bs[0];
            var posval = bs[1] - 1;
            while (posval >= 0) {
                if (value & (1 << posval)) { bytenew |= (1 << bytepos); }
                posval--;
                bytepos--;
                if (bytepos < 0) {
                    if (bytenew == 0xFF) {
                        writeByte(0xFF);
                        writeByte(0);
                    } else { writeByte(bytenew); }
                    bytepos = 7;
                    bytenew = 0;
                }
            }
        }

        function writeByte(value) { byteout.push(clt[value]); }

        function writeWord(value) {
            writeByte((value >> 8) & 0xFF);
            writeByte((value) & 0xFF);
        }

        function fDCTQuant(data, fdtbl) {
            var d0, d1, d2, d3, d4, d5, d6, d7;
            var dataOff = 0;
            var i;
            const I8 = 8;
            const I64 = 64;
            for (i = 0; i < I8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 1];
                d2 = data[dataOff + 2];
                d3 = data[dataOff + 3];
                d4 = data[dataOff + 4];
                d5 = data[dataOff + 5];
                d6 = data[dataOff + 6];
                d7 = data[dataOff + 7];
                var tmp0 = d0 + d7;
                var tmp7 = d0 - d7;
                var tmp1 = d1 + d6;
                var tmp6 = d1 - d6;
                var tmp2 = d2 + d5;
                var tmp5 = d2 - d5;
                var tmp3 = d3 + d4;
                var tmp4 = d3 - d4;
                var tmp10 = tmp0 + tmp3;
                var tmp13 = tmp0 - tmp3;
                var tmp11 = tmp1 + tmp2;
                var tmp12 = tmp1 - tmp2;
                data[dataOff] = tmp10 + tmp11;
                data[dataOff + 4] = tmp10 - tmp11;
                var z1 = (tmp12 + tmp13) * 0.707106781;
                data[dataOff + 2] = tmp13 + z1;
                data[dataOff + 6] = tmp13 - z1;
                tmp10 = tmp4 + tmp5;
                tmp11 = tmp5 + tmp6;
                tmp12 = tmp6 + tmp7;
                var z5 = (tmp10 - tmp12) * 0.382683433;
                var z2 = 0.541196100 * tmp10 + z5;
                var z4 = 1.306562965 * tmp12 + z5;
                var z3 = tmp11 * 0.707106781;
                var z11 = tmp7 + z3;
                var z13 = tmp7 - z3;
                data[dataOff + 5] = z13 + z2;
                data[dataOff + 3] = z13 - z2;
                data[dataOff + 1] = z11 + z4;
                data[dataOff + 7] = z11 - z4;
                dataOff += 8;
            }
            dataOff = 0;
            for (i = 0; i < I8; ++i) {
                d0 = data[dataOff];
                d1 = data[dataOff + 8];
                d2 = data[dataOff + 16];
                d3 = data[dataOff + 24];
                d4 = data[dataOff + 32];
                d5 = data[dataOff + 40];
                d6 = data[dataOff + 48];
                d7 = data[dataOff + 56];
                var tmp0p2 = d0 + d7;
                var tmp7p2 = d0 - d7;
                var tmp1p2 = d1 + d6;
                var tmp6p2 = d1 - d6;
                var tmp2p2 = d2 + d5;
                var tmp5p2 = d2 - d5;
                var tmp3p2 = d3 + d4;
                var tmp4p2 = d3 - d4;
                var tmp10p2 = tmp0p2 + tmp3p2;
                var tmp13p2 = tmp0p2 - tmp3p2;
                var tmp11p2 = tmp1p2 + tmp2p2;
                var tmp12p2 = tmp1p2 - tmp2p2;
                data[dataOff] = tmp10p2 + tmp11p2;
                data[dataOff + 32] = tmp10p2 - tmp11p2;
                var z1p2 = (tmp12p2 + tmp13p2) * 0.707106781;
                data[dataOff + 16] = tmp13p2 + z1p2;
                data[dataOff + 48] = tmp13p2 - z1p2;
                tmp10p2 = tmp4p2 + tmp5p2;
                tmp11p2 = tmp5p2 + tmp6p2;
                tmp12p2 = tmp6p2 + tmp7p2;
                var z5p2 = (tmp10p2 - tmp12p2) * 0.382683433;
                var z2p2 = 0.541196100 * tmp10p2 + z5p2;
                var z4p2 = 1.306562965 * tmp12p2 + z5p2;
                var z3p2 = tmp11p2 * 0.707106781;
                var z11p2 = tmp7p2 + z3p2;
                var z13p2 = tmp7p2 - z3p2;
                data[dataOff + 40] = z13p2 + z2p2;
                data[dataOff + 24] = z13p2 - z2p2;
                data[dataOff + 8] = z11p2 + z4p2;
                data[dataOff + 56] = z11p2 - z4p2;
                dataOff++;
            }
            var fDCTQuant;
            for (i = 0; i < I64; ++i) {
                fDCTQuant = data[i] * fdtbl[i];
                outputfDCTQuant[i] = (fDCTQuant > 0.0) ? ((fDCTQuant + 0.5) | 0) : ((fDCTQuant - 0.5) | 0);
            }
            return outputfDCTQuant;
        }

        function writeAPP0() {
            writeWord(0xFFE0);
            writeWord(16);
            writeByte(0x4A);
            writeByte(0x46);
            writeByte(0x49);
            writeByte(0x46);
            writeByte(0);
            writeByte(1);
            writeByte(1);
            writeByte(0);
            writeWord(1);
            writeWord(1);
            writeByte(0);
            writeByte(0);
        }

        function writeSOF0(width, height) {
            writeWord(0xFFC0);
            writeWord(17);
            writeByte(8);
            writeWord(height);
            writeWord(width);
            writeByte(3);
            writeByte(1);
            writeByte(0x11);
            writeByte(0);
            writeByte(2);
            writeByte(0x11);
            writeByte(1);
            writeByte(3);
            writeByte(0x11);
            writeByte(1);
        }

        function writeDQT() {
            writeWord(0xFFDB);
            writeWord(132);
            writeByte(0);
            for (var i = 0; i < 64; i++) { writeByte(YTable[i]); }
            writeByte(1);
            for (var j = 0; j < 64; j++) { writeByte(UVTable[j]); }
        }

        function writeDHT() {
            writeWord(0xFFC4);
            writeWord(0x01A2);
            writeByte(0);
            for (var i = 0; i < 16; i++) { writeByte(std_dc_luminance_nrcodes[i + 1]); }
            for (var j = 0; j <= 11; j++) { writeByte(std_dc_luminance_values[j]); }
            writeByte(0x10);
            for (var k = 0; k < 16; k++) { writeByte(std_ac_luminance_nrcodes[k + 1]); }
            for (var l = 0; l <= 161; l++) { writeByte(std_ac_luminance_values[l]); }
            writeByte(1);
            for (var m = 0; m < 16; m++) { writeByte(std_dc_chrominance_nrcodes[m + 1]); }
            for (var n = 0; n <= 11; n++) { writeByte(std_dc_chrominance_values[n]); }
            writeByte(0x11);
            for (var o = 0; o < 16; o++) { writeByte(std_ac_chrominance_nrcodes[o + 1]); }
            for (var p = 0; p <= 161; p++) { writeByte(std_ac_chrominance_values[p]); }
        }

        function writeSOS() {
            writeWord(0xFFDA);
            writeWord(12);
            writeByte(3);
            writeByte(1);
            writeByte(0);
            writeByte(2);
            writeByte(0x11);
            writeByte(3);
            writeByte(0x11);
            writeByte(0);
            writeByte(0x3f);
            writeByte(0);
        }

        function processDU(CDU, fdtbl, DC, HTDC, HTAC) {
            var EOB = HTAC[0x00];
            var M16zeroes = HTAC[0xF0];
            var pos;
            const I16 = 16;
            const I63 = 63;
            const I64 = 64;
            var DU_DCT = fDCTQuant(CDU, fdtbl);
            for (var j = 0; j < I64; ++j) { DU[ZigZag[j]] = DU_DCT[j]; }
            var Diff = DU[0] - DC;
            DC = DU[0];
            if (Diff == 0) { writeBits(HTDC[0]); } else {
                pos = 32767 + Diff;
                writeBits(HTDC[category[pos]]);
                writeBits(bitcode[pos]);
            }
            var end0pos = 63;
            for (;
                (end0pos > 0) && (DU[end0pos] == 0); end0pos--) {};
            if (end0pos == 0) {
                writeBits(EOB);
                return DC;
            }
            var i = 1;
            var lng;
            while (i <= end0pos) {
                var startpos = i;
                for (;
                    (DU[i] == 0) && (i <= end0pos); ++i) {}
                var nrzeroes = i - startpos;
                if (nrzeroes >= I16) {
                    lng = nrzeroes >> 4;
                    for (var nrmarker = 1; nrmarker <= lng; ++nrmarker)
                        writeBits(M16zeroes);
                    nrzeroes = nrzeroes & 0xF;
                }
                pos = 32767 + DU[i];
                writeBits(HTAC[(nrzeroes << 4) + category[pos]]);
                writeBits(bitcode[pos]);
                i++;
            }
            if (end0pos != I63) { writeBits(EOB); }
            return DC;
        }

        function initCharLookupTable() {
            var sfcc = String.fromCharCode;
            for (var i = 0; i < 256; i++) { clt[i] = sfcc(i); }
        }
        this.encode = function(image, quality) {
            var time_start = new Date().getTime();
            if (quality) setQuality(quality);
            byteout = new Array();
            bytenew = 0;
            bytepos = 7;
            writeWord(0xFFD8);
            writeAPP0();
            writeDQT();
            writeSOF0(image.width, image.height);
            writeDHT();
            writeSOS();
            var DCY = 0;
            var DCU = 0;
            var DCV = 0;
            bytenew = 0;
            bytepos = 7;
            this.encode.displayName = "_encode_";
            var imageData = image.data;
            var width = image.width;
            var height = image.height;
            var quadWidth = width * 4;
            var tripleWidth = width * 3;
            var x, y = 0;
            var r, g, b;
            var start, p, col, row, pos;
            while (y < height) {
                x = 0;
                while (x < quadWidth) {
                    start = quadWidth * y + x;
                    p = start;
                    col = -1;
                    row = 0;
                    for (pos = 0; pos < 64; pos++) {
                        row = pos >> 3;
                        col = (pos & 7) * 4;
                        p = start + (row * quadWidth) + col;
                        if (y + row >= height) { p -= (quadWidth * (y + 1 + row - height)); }
                        if (x + col >= quadWidth) { p -= ((x + col) - quadWidth + 4) }
                        r = imageData[p++];
                        g = imageData[p++];
                        b = imageData[p++];
                        YDU[pos] = ((RGB_YUV_TABLE[r] + RGB_YUV_TABLE[(g + 256) >> 0] + RGB_YUV_TABLE[(b + 512) >> 0]) >> 16) - 128;
                        UDU[pos] = ((RGB_YUV_TABLE[(r + 768) >> 0] + RGB_YUV_TABLE[(g + 1024) >> 0] + RGB_YUV_TABLE[(b + 1280) >> 0]) >> 16) - 128;
                        VDU[pos] = ((RGB_YUV_TABLE[(r + 1280) >> 0] + RGB_YUV_TABLE[(g + 1536) >> 0] + RGB_YUV_TABLE[(b + 1792) >> 0]) >> 16) - 128;
                    }
                    DCY = processDU(YDU, fdtbl_Y, DCY, YDC_HT, YAC_HT);
                    DCU = processDU(UDU, fdtbl_UV, DCU, UVDC_HT, UVAC_HT);
                    DCV = processDU(VDU, fdtbl_UV, DCV, UVDC_HT, UVAC_HT);
                    x += 32;
                }
                y += 8;
            }
            if (bytepos >= 0) {
                var fillbits = [];
                fillbits[1] = bytepos + 1;
                fillbits[0] = (1 << (bytepos + 1)) - 1;
                writeBits(fillbits);
            }
            writeWord(0xFFD9);
            var jpegDataUri = 'data:image/jpeg;base64,' + btoa(byteout.join(''));
            byteout = [];
            var duration = new Date().getTime() - time_start;
            console.log('Encoding time: ' + duration + 'ms');
            return jpegDataUri
        }

        function setQuality(quality) {
            if (quality <= 0) { quality = 1; }
            if (quality > 100) { quality = 100; }
            if (currentQuality == quality) return
            var sf = 0;
            if (quality < 50) { sf = Math.floor(5000 / quality); } else { sf = Math.floor(200 - quality * 2); }
            initQuantTables(sf);
            currentQuality = quality;
            console.log('Quality set to: ' + quality + '%');
        }

        function init() {
            var time_start = new Date().getTime();
            if (!quality) quality = 50;
            initCharLookupTable()
            initHuffmanTbl();
            initCategoryNumber();
            initRGBYUVTable();
            setQuality(quality);
            var duration = new Date().getTime() - time_start;
            console.log('Initialization ' + duration + 'ms');
        }
        init();
    };

    function getImageDataFromImage(idOrElement) {
        var theImg = (typeof(idOrElement) == 'string') ? document.getElementById(idOrElement) : idOrElement;
        var cvs = document.createElement('canvas');
        cvs.width = theImg.width;
        cvs.height = theImg.height;
        var ctx = cvs.getContext("2d");
        ctx.drawImage(theImg, 0, 0);
        return (ctx.getImageData(0, 0, cvs.width, cvs.height));
    }
    /*****image_compress.js**/
    /**
     * 图片压缩静态类 from qzone
     */
    var ImageCompresser = {
        /**
         * 检测ios平台是否有做过抽样处理
         * @param {Element} img
         */
        isIosSubSample: function(img) {
            var w = img.naturalWidth,
                h = img.naturalHeight,
                hasSubSample = false;
            if (w * h > 1024 * 1024) { //超过1K*1K分辨率的图会被抽样
                var canvas = document.createElement('canvas');
                ctx = canvas.getContext('2d'),
                    canvas.width = canvas.height = 1;
                ctx.drawImage(img, 1 - w, 0);
                hasSubSample = ctx.getImageData(0, 0, 1, 1).data[3] === 0;
                canvas = ctx = null; //清理
            }
            return hasSubSample;
        },

        /**
         * 获取ios上图片被压缩比例
         * 随机使用1px宽度尝试绘制样图，估算原图被ios压缩了多少
         * @param {Element} img
         * @param {Number} w
         * @param {Number} h
         */
        getIosImageRatio: function(img, w, h) {
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                data,
                sy = 0, //起始y坐标
                ey = h, //结束y坐标
                py = h; //当前判断的y坐标
            canvas.width = 1;
            canvas.height = h
            ctx.drawImage(img, 1 - Math.ceil(Math.random() * w), 0); //随机画1px宽度
            data = ctx.getImageData(0, 0, 1, h).data;
            while (py > sy) {
                var alpha = data[(py - 1) * 4 + 3]; //Notice:如果原图自带透明度，这里可能会失效
                if (alpha === 0) {
                    ey = py;
                } else {
                    sy = py;
                }
                py = (ey + sy) >> 1;
            }
            return py / h;
        },

        /**
         * 获取图片base64
         * @param {Elemnt} img
         * @param {opts} opts
         *      opts.maxW {Number}  目标图片最大宽度
         *      opts.maxH {Number}  目标图片最大高度
         *      quality {Number}    目标图片压缩质量
         *      orien {Number}      目标图片旋转方向
         */
        getImageBase64: function(img, opts) {

            //获取配置
            var maxW = opts.maxW, //图片最大限制
                maxH = opts.maxW,
                quality = opts.quality,
                _w = img.naturalWidth, //图片实际大小
                _h = img.naturalHeight,
                w, h; //图片目标大小

            var USER_AGENT = navigator.userAgent;
            var iphone = USER_AGENT.match(/(iPhone\sOS)\s([\d_]+)/);
            var android = USER_AGENT.match(/(Android)\s+([\d.]+)/);

            //ios平台针对大图做抽值处理
            if (iphone && ImageCompresser.isIosSubSample(img)) {
                _w = _w / 2;
                _h = _h / 2;
            }
            //获取最终生成图片大小
            if (_w > maxW && _w / _h >= maxW / maxH) {
                w = maxW;
                h = _h * maxW / _w;
            } else if (_h > maxH && _h / _w >= maxH / maxW) {
                w = _w * maxH / _h;
                h = maxH;
            } else {
                w = _w;
                h = _h;
            }
            //canvas临时工具
            var canvas = document.createElement('canvas'),
                ctx = canvas.getContext('2d'),
                base64Str;
            this.doAutoRotate(canvas, w, h, opts.orien);
            //ios平台贴瓷砖处理大图片
            if (iphone) {
                var tmpCanvas = document.createElement('canvas'),
                    tmpCtx = tmpCanvas.getContext('2d'),
                    d = 1024, //瓷砖canvas的大小
                    vertSquashRatio = ImageCompresser.getIosImageRatio(img, _w, _h), //ios平台大尺寸图片压缩比
                    sx, sy, sw, sh, dx, dy, dw, dh;
                tmpCanvas.width = tmpCanvas.height = d;
                sy = 0;
                while (sy < _h) {
                    sh = sy + d > _h ? _h - sy : d,
                        sx = 0;
                    while (sx < _w) {
                        sw = sx + d > _w ? _w - sx : d;
                        tmpCtx.clearRect(0, 0, d, d);
                        tmpCtx.drawImage(img, -sx, -sy);
                        dx = Math.floor(sx * w / _w);
                        dw = Math.ceil(sw * w / _w);
                        dy = Math.floor(sy * h / _h / vertSquashRatio);
                        dh = Math.ceil(sh * h / _h / vertSquashRatio);
                        ctx.drawImage(tmpCanvas, 0, 0, sw, sh, dx, dy, dw, dh);
                        sx += d;
                    }
                    sy += d;
                }
                tmpCanvas = tmpCtx = null;
            } else {
                ctx.drawImage(img, 0, 0, _w, _h, 0, 0, w, h);
            }
            //android平台调用jpegEncoder处理生成jpg压缩格式
            if (android) {
                var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height),
                    encoder = new JPEGEncoder(quality * 100);
                base64Str = encoder.encode(imgData);
                encoder = null;
            } else {
                base64Str = canvas.toDataURL('image/jpeg', quality);
            }

            // console.log(base64Str);
            canvas = ctx = null;
            return base64Str;
        },
        /**
         * 旋转图片
         * @param {Element} canvas 画布
         * @param {Number} width 宽度
         * @param {Number} height 高度
         * @param {Number} orientation 旋转角度[1|2|3|4|5|6|7|8]
         */
        doAutoRotate: function(canvas, width, height, orientation) {
            var ctx = canvas.getContext('2d');
            if (orientation >= 5 && orientation <= 8) {
                canvas.width = height;
                canvas.height = width;
            } else {
                canvas.width = width;
                canvas.height = height;
            }
            switch (orientation) {
                case 2:
                    // horizontal flip
                    ctx.translate(width, 0);
                    ctx.scale(-1, 1);
                    break;
                case 3:
                    // 180 rotate left
                    ctx.translate(width, height);
                    ctx.rotate(Math.PI);
                    break;
                case 4:
                    // vertical flip
                    ctx.translate(0, height);
                    ctx.scale(1, -1);
                    break;
                case 5:
                    // vertical flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.scale(1, -1);
                    break;
                case 6:
                    // 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(0, -height);
                    break;
                case 7:
                    // horizontal flip + 90 rotate right
                    ctx.rotate(0.5 * Math.PI);
                    ctx.translate(width, -height);
                    ctx.scale(-1, 1);
                    break;
                case 8:
                    // 90 rotate left
                    ctx.rotate(-0.5 * Math.PI);
                    ctx.translate(-width, 0);
                    break;
                default:
                    break;
            }
        },
        /**
         * 获取文件地址
         * @param {File} file
         */
        getFileObjectURL: function(file) {
            var URL = window.URL || window.webkitURL || false;
            if (URL) {
                return URL.createObjectURL(file);
            }
        },

        /**
         * 是否支持本地压缩
         */
        support: function() {
            return typeof(window.File) && typeof(window.FileList) && typeof(window.FileReader) && typeof(window.Blob);
        }
    };
    module.exports = photo;

})
