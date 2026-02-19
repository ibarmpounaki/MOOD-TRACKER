let selectedMood = null;

$(".mood").click(function () {
    $(".mood").removeClass("selected");

    $(this).addClass("selected");
    $("#selectedMoodInput").val($(this).data("mood"));
    $("#selectedColorInput").val($(this).data("color"));
    selectedMood = $(this);
});

$(".ok").click(function () {
    if (selectedMood) {
        selectedMood.removeClass("selected");
    }
    selectedMood = null;

    // check if values have been assigned (mood or/and journal)


});

$(".day").click(function () {


});



