using System;

// See https://aka.ms/new-console-template for more information
namespace csharp
{
    class Program
    {
        int meta = 0;
        static void Main(string[] args)
        {
            Console.WriteLine("Hello, World!", args);
            Program met = new Program();
            met.metas(20);

        }
        void metas(int dat) {
            Console.WriteLine("Next, " + (meta + dat));
        }
    }
}
