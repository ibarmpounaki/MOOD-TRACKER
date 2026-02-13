let selectedMood = null;

$(".mood").click(function () {
    $(".mood").removeClass("selected");

    $(this).addClass("selected");
    $("#selectedMoodInput").val($(this).data("mood"));
    selectedMood = $(this);
});


$(".ok").click(function () {
    if (selectedMood) {
        selectedMood.removeClass("selected");
    }
    selectedMood = null;
});

$(".day").click(function () {


});



