using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WanderVN.Domain.Entities;

namespace WanderVN.Application.Common.Interfaces
{
    public interface IJwtService
    {
        string GenerateAccessToken(Users user);
    }
}
