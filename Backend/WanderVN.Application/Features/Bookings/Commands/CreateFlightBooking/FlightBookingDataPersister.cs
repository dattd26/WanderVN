using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using WanderVN.Application.Common.Interfaces;
using WanderVN.Application.DTOs.Request;
using WanderVN.Domain.Entities;
using WanderVN.Domain.Repositories;

namespace WanderVN.Application.Features.Bookings.Commands.CreateFlightBooking;

public class FlightBookingDataPersister : IFlightBookingDataPersister
{
    private readonly IUnitOfWork _unitOfWork;

    public FlightBookingDataPersister(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task PersistFlightDataAsync(
        WanderVN.Domain.Entities.Bookings booking,
        JsonDocument duffelResponse,
        List<PassengerDto> passengers,
        CancellationToken cancellationToken)
    {
        var root = duffelResponse.RootElement;

        // Bộ nhớ đệm tạm thời để tránh truy vấn trùng lặp hoặc tạo mới trùng lặp trong cùng một request
        var airlinesCache = new Dictionary<string, Airlines>(StringComparer.OrdinalIgnoreCase);
        var airportsCache = new Dictionary<string, Airports>(StringComparer.OrdinalIgnoreCase);
        var flightsCache = new Dictionary<string, WanderVN.Domain.Entities.Flights>();

        var bookingFlights = new List<BookingFlights>();

        if (root.TryGetProperty("data", out var dataProp) &&
            dataProp.TryGetProperty("slices", out var slicesProp) &&
            slicesProp.ValueKind == JsonValueKind.Array)
        {
            foreach (var slice in slicesProp.EnumerateArray())
            {
                if (slice.TryGetProperty("segments", out var segmentsProp) &&
                    segmentsProp.ValueKind == JsonValueKind.Array)
                {
                    foreach (var segment in segmentsProp.EnumerateArray())
                    {
                        string segmentId = segment.TryGetProperty("id", out var segIdVal) ? (segIdVal.GetString() ?? "") : "";

                        // Xác định hãng bay (ưu tiên operating_carrier, fallback marketing_carrier)
                        Airlines? airline = null;
                        if (segment.TryGetProperty("operating_carrier", out var carrier) && carrier.ValueKind == JsonValueKind.Object)
                        {
                            airline = await GetOrCreateAirlineAsync(carrier, airlinesCache, cancellationToken);
                        }
                        if (airline == null && segment.TryGetProperty("marketing_carrier", out carrier) && carrier.ValueKind == JsonValueKind.Object)
                        {
                            airline = await GetOrCreateAirlineAsync(carrier, airlinesCache, cancellationToken);
                        }

                        // Lấy/tạo sân bay đi
                        Airports? depAirport = null;
                        if (segment.TryGetProperty("origin", out var originObj) && originObj.ValueKind == JsonValueKind.Object)
                        {
                            depAirport = await GetOrCreateAirportAsync(originObj, airportsCache, cancellationToken);
                        }

                        // Lấy/tạo sân bay đến
                        Airports? arrAirport = null;
                        if (segment.TryGetProperty("destination", out var destObj) && destObj.ValueKind == JsonValueKind.Object)
                        {
                            arrAirport = await GetOrCreateAirportAsync(destObj, airportsCache, cancellationToken);
                        }

                        // Lấy thông tin chuyến bay
                        var flightNumber = segment.TryGetProperty("operating_carrier_flight_number", out var fnVal)
                            ? fnVal.GetString()
                            : (segment.TryGetProperty("marketing_carrier_flight_number", out var mfnVal) ? mfnVal.GetString() : "N/A");

                        if (string.IsNullOrEmpty(flightNumber))
                        {
                            flightNumber = "N/A";
                        }

                        var depTimeStr = segment.TryGetProperty("departing_at", out var depVal) ? depVal.GetString() : null;
                        var arrTimeStr = segment.TryGetProperty("arriving_at", out var arrVal) ? arrVal.GetString() : null;

                        DateTime depTime = !string.IsNullOrEmpty(depTimeStr) ? DateTime.Parse(depTimeStr) : DateTime.UtcNow;
                        DateTime arrTime = !string.IsNullOrEmpty(arrTimeStr) ? DateTime.Parse(arrTimeStr) : DateTime.UtcNow;

                        var flightKey = $"{flightNumber}_{depTime:yyyyMMddHHmmss}";
                        WanderVN.Domain.Entities.Flights? flight = null;

                        if (flightsCache.TryGetValue(flightKey, out var cachedFlight))
                        {
                            flight = cachedFlight;
                        }
                        else
                        {
                            flight = await _unitOfWork.Flights.FindFirstOrDefaultAsync(
                                f => f.FlightNumber == flightNumber && f.DepTime == depTime,
                                cancellationToken: cancellationToken);

                            if (flight == null)
                            {
                                flight = new WanderVN.Domain.Entities.Flights
                                {
                                    Airline = airline,
                                    FlightNumber = flightNumber,
                                    DepAirport = depAirport,
                                    ArrAirport = arrAirport,
                                    DepTime = depTime,
                                    ArrTime = arrTime,
                                    Price = 0m,
                                    Status = "Scheduled"
                                };
                            }
                            flightsCache[flightKey] = flight;
                        }

                        // Ánh xạ hành khách với chặng bay này
                        foreach (var pax in passengers)
                        {
                            var seatNumber = FindSeatNumber(root, pax.Id, segmentId, pax.GivenName, pax.FamilyName);

                            var bookingFlight = new BookingFlights
                            {
                                Booking = booking,
                                PassengerName = $"{pax.Title} {pax.GivenName} {pax.FamilyName}",
                                PassportNumber = pax.PassportNumber,
                                Flight = flight,
                                SeatNumber = seatNumber
                            };
                            bookingFlights.Add(bookingFlight);
                        }
                    }
                }
            }
        }

        // Chỉ thêm vào tracker và lưu DB sau khi phân tích JSON hoàn toàn thành công
        if (bookingFlights.Any())
        {
            foreach (var bf in bookingFlights)
            {
                await _unitOfWork.Repository<BookingFlights>().AddAsync(bf, cancellationToken);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }
        else
        {
            throw new Exception("Không phân tích được chặng bay hoặc hành khách nào từ phản hồi Duffel.");
        }
    }

    private async Task<Airlines?> GetOrCreateAirlineAsync(
        JsonElement carrierObj,
        Dictionary<string, Airlines> cache,
        CancellationToken cancellationToken)
    {
        var airlineName = carrierObj.TryGetProperty("name", out var nameVal) ? nameVal.GetString() : null;
        if (string.IsNullOrWhiteSpace(airlineName)) return null;

        if (cache.TryGetValue(airlineName, out var cached))
        {
            return cached;
        }

        var airline = await _unitOfWork.Repository<Airlines>().FindFirstOrDefaultAsync(
            a => a.Name == airlineName,
            cancellationToken: cancellationToken);

        if (airline == null)
        {
            var logoUrl = carrierObj.TryGetProperty("logo_symbol_url", out var logoSymbolVal)
                ? logoSymbolVal.GetString()
                : (carrierObj.TryGetProperty("logo_lockup_url", out var logoLockupVal) ? logoLockupVal.GetString() : null);

            airline = new Airlines
            {
                Name = airlineName,
                LogoUrl = logoUrl
            };
        }

        cache[airlineName] = airline;
        return airline;
    }

    private async Task<Airports?> GetOrCreateAirportAsync(
        JsonElement airportObj,
        Dictionary<string, Airports> cache,
        CancellationToken cancellationToken)
    {
        var iataCode = airportObj.TryGetProperty("iata_code", out var iataVal) ? iataVal.GetString() : null;
        if (string.IsNullOrWhiteSpace(iataCode)) return null;

        if (cache.TryGetValue(iataCode, out var cached))
        {
            return cached;
        }

        var airport = await _unitOfWork.Repository<Airports>().FindFirstOrDefaultAsync(
            a => a.IataCode == iataCode,
            cancellationToken: cancellationToken);

        if (airport == null)
        {
            var airportName = airportObj.TryGetProperty("name", out var nameVal) ? nameVal.GetString() : null;
            string? city = null;
            if (airportObj.TryGetProperty("city_name", out var cityVal))
            {
                city = cityVal.GetString();
            }
            else if (airportObj.TryGetProperty("city", out var cityObjVal) && cityObjVal.ValueKind == JsonValueKind.Object)
            {
                if (cityObjVal.TryGetProperty("name", out var cityNameVal))
                {
                    city = cityNameVal.GetString();
                }
            }

            airport = new Airports
            {
                IataCode = iataCode,
                Name = airportName,
                City = city
            };
        }

        cache[iataCode] = airport;
        return airport;
    }

    private string? FindSeatNumber(
        JsonElement root,
        string passengerId,
        string segmentId,
        string givenName,
        string familyName)
    {
        try
        {
            if (root.TryGetProperty("data", out var dataProp) &&
                dataProp.TryGetProperty("passengers", out var passengersProp) &&
                passengersProp.ValueKind == JsonValueKind.Array)
            {
                foreach (var passenger in passengersProp.EnumerateArray())
                {
                    var pId = passenger.TryGetProperty("id", out var idVal) ? idVal.GetString() : null;
                    var pGivenName = passenger.TryGetProperty("given_name", out var gnVal) ? gnVal.GetString() : null;
                    var pFamilyName = passenger.TryGetProperty("family_name", out var fnVal) ? fnVal.GetString() : null;

                    // Khớp theo ID của Duffel hoặc họ tên hành khách
                    bool isMatch = pId == passengerId ||
                                   (pGivenName?.Equals(givenName, StringComparison.OrdinalIgnoreCase) == true &&
                                    pFamilyName?.Equals(familyName, StringComparison.OrdinalIgnoreCase) == true);

                    if (isMatch)
                    {
                        if (passenger.TryGetProperty("seats", out var seatsProp) &&
                            seatsProp.ValueKind == JsonValueKind.Array)
                        {
                            foreach (var seat in seatsProp.EnumerateArray())
                            {
                                var segId = seat.TryGetProperty("segment_id", out var segIdVal) ? segIdVal.GetString() : null;
                                if (segId == segmentId)
                                {
                                    return seat.TryGetProperty("designator", out var desVal) ? desVal.GetString() : null;
                                }
                            }
                        }
                    }
                }
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine($"⚠️ Lỗi khi trích xuất số ghế: {ex.Message}");
        }
        return null;
    }
}
