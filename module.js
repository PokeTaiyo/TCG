 var Collection;

 $.getJSON('https://cdn.rawgit.com/PokeTaiyo/TCG/master/collection.json', function (data) {
     Collection = data;
 });

 $("select").change(function () {
     window.tid = $(this).val()
 }), $("input[name=\"optionsBooster\"]").change(function () {
     window.booster = $(this).val(), window.tirage = $(this).data("tirage")
 });

 function Random(array, i, fetch) {
     for (var x = fetch.length + tirage[i]; fetch.length < x;) {
         var obj = {},
             k = Math.floor(Math.random() * array.length);
         obj.url = array[k].url, obj.index = array[k].num;
         var check = $.grep(fetch, function (d) {
             return d.url === obj.url
         });
         0 === check.length && fetch.push(obj)
     }
 }

 function Tirage(collection) {
     var fetch = [];
     for (i = 0, type = ["commune", "unco", "rare"], tirage; i < type.length; i++) window.type[i] = $.grep(collection, function (d) {
         return d.type === type[i]
     }), Random(window.type[i], i, fetch);
     return fetch
 }
 $(".submit").on("click", function () {
     function SendCollec(data, doublons, etinc) {
         var bloc = $(data).find(`.c_${booster}`),
             bloc = $(bloc);
         bloc.children("img,br").remove(), bloc.append("[img]" + window[`c_${booster}`].join("[/img][img]") + "[/img]");
         var bloc2 = bloc.siblings(`.c_etincelantes`),
             bloc2 = $(bloc2);
         etincIsChecked && 0 < etinc.length && (bloc2.children("br").remove(), bloc2.append("[img]" + etinc[0] + "[/img]"));
         var bloc3 = bloc2.siblings(`.c_doublons`),
             bloc3 = $(bloc3);
         bloc3.children("br").remove(), bloc3.append("[img]" + doublons.join("[/img][img]") + "[/img]");
         var wrapper = bloc3.closest(".postbody"),
             wrapper = $(wrapper);
         window.msg = wrapper.html();
         var pid = $("select.tcg option:selected").data("pid");
         $("input.message").val(window.msg), $("form.tcg-edit").prop("action", "post?p=" + pid + "&mode=editpost"), $("button.edit").prop("disabled", !1)
     }

     function EditCollec(data, etinc, result) {
         var back = ["http://image.noelshack.com/fichiers/2016/43/1477581273-tcg.png", "http://image.noelshack.com/fichiers/2017/49/2/1512482805-dos-de-carte-rr.png"],
             duplic = [];
         for (i = 0; i < result.length; i++)
             if (window[`c_${booster}`].includes(result[i].url)) duplic.push(result[i].url);
             else {
                 var n, index = +result[i].index - 1;
                 n = back.includes(window[`c_${booster}`][index]) ? 1 : 0,
                     window[`c_${booster}`].splice(index, n, result[i].url)
             }
         etincIsChecked && window[`c_etincelantes`].includes(etinc[0]) && (duplic.push(etinc[0]), etinc = []);
         SendCollec(data, duplic, etinc)
     }

     var result = Tirage(Collection[booster]),
         etincIsChecked = 0 < $("input[name=\"optionsEtinc\"]:checked").length;
     if (etincIsChecked) {
         var k = Math.floor(Math.random() * Collection.etincelante.length),
             etinc = [];
         etinc.push(Collection.etincelante[k])
     }
     if ("ext3" == [booster]) {
         var legend = $.grep(Collection.ext3, function (d) {
             return "legend" === d.type
         });
         n = Math.floor(4 * Math.random()), k = Math.floor(Math.random() * legend.length), legend[k].index = legend[k].num, 1 === n && result.push(legend[k]);
     }
     var puzzle = [];
     for (k = Math.floor(Math.random() * Collection.puzzle.length), puzzle.push(Collection.puzzle[k]), (i = 0, display = []); i < result.length; i++) display.push(result[i].url);

     var textarea = $("#tcg-result");
     textarea.html("[img]" + display.join("[/img][img]") + "[/img][img]" + puzzle + "[/img]"),
         etincIsChecked && $("textarea#tcg-result").html($("textarea#tcg-result").html() + "[img]" + etinc + "[/img]"),
         $(".copy").on("click", function () {
             textarea.select(), document.execCommand("copy"), alert("R\xE9sultat du tirage copi\xE9 dans le presse-papier !")
         }),
         $.ajax({
             url: "/t" + [tid] + "-",
             dataType: "html"
         }).then(function (data) {
             var section = $(data).find(".collec").children("div");
             for (i = 0; i < section.length; i++) {
                 var name = $(section[i]).attr("class");
                 window[name] = [];
                 var cartes = $(section[i]).children("img");
                 for (j = 0; j < cartes.length; j++) window[name].push(cartes[j].src)
             }
             EditCollec(data, etinc, result)
         }).fail(function () {
             alert("Edition Auto impossible : \n Vérifiez votre connexion internet \n Assurez vous que la collection du membre est correctement structurée");
         })
 }), $("button.edit").on("click", function () {
     $(".submit-tcg").trigger("click")
 });
