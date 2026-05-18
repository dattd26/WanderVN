using Microsoft.AspNetCore.Mvc;

namespace WanderVN.API.Controllers
{
    [Route("api")]
    [ApiController]
    public class HelloController : ControllerBase
    {
        [HttpGet("hello")]
        public IActionResult Hello()
        {
            return Ok("Hello World!");
        }
    }
}