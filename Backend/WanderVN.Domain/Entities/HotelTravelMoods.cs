using System;

namespace WanderVN.Domain.Entities;

public partial class HotelTravelMoods
{
    public int HotelId { get; set; }
    public string TravelMoodId { get; set; } = null!;

    public virtual Hotels Hotel { get; set; } = null!;
    public virtual HomeTravelMoods TravelMood { get; set; } = null!;
}
